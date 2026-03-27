# Certificate signing (BECE)

HMAC signing for BECE certificate integrity. **Server-side only.**

## Environment

Add to `.env.local` (or your deployment env):

```bash
# At least 16 characters; keep secret. Used to sign/verify certificate payloads.
CERT_SIGNING_SECRET=your-secret-key-here
```

If `CERT_SIGNING_SECRET` is not set or too short, the sign and verify APIs return 503 and the certificate still generates but the QR code will not include a signature (verify page will show "Signature invalid or verification unavailable").

## Endpoints

- **POST /api/certificate/sign** — Body: `{ name, examNo, serial?, year? }`. Returns `{ sig }` (base64 HMAC-SHA256).
- **POST /api/certificate/verify** — Body: `{ payload, sig }`. Returns `{ valid: boolean }`.

## Flow

1. Certificate generator builds payload, calls `/api/certificate/sign`, then encodes payload + `sig` into the QR code.
2. QR code points to `/result-checking/bece/verify?data=<base64>`.
3. Verify page decodes payload, shows details, and offers "View result" → BECE login with exam number prefilled.
4. Optional: user clicks "Verify signature" on the verify page to check HMAC via `/api/certificate/verify`.
