# UBEAT Student Portal

This directory contains the UBEAT (Universal Basic Education Achievement Test) student portal with an alternative access method for students without exam numbers.

## Features

### 1. **Standard Login (Exam Number)**
- Students can log in using their official UBEAT exam number
- Format validation: `xx/xxx/xxxx/xxx` (e.g., `ok/977/2025/001`)
- Real-time validation feedback
- Automatic redirection to dashboard upon successful login

### 2. **Alternative Form (No Exam Number)**
For students who don't have their exam number, an alternative form is available that requires:
- **Full Name**: Student's complete name (text input)
- **LGA**: Local Government Area (dropdown with all 27 Imo State LGAs)
- **School Name**: Name of the school attended (searchable dropdown, dynamically loads schools based on selected LGA)
- **Exam Year**: Year the exam was taken (e.g., 2025)

**Smart Features:**
- LGA dropdown shows all Imo State LGAs
- School Name dropdown automatically fetches schools for the selected LGA
- School Name field shows loading state while fetching
- School Name is searchable for quick selection
- Selecting a new LGA clears the previously selected school

#### Payment Requirement
- Students using the alternative form must pay **₦500** to access their results
- Payment is processed through a secure gateway
- Multiple payment methods supported:
  - Debit/Credit Cards
  - Bank Transfer
  - USSD

### 3. **Abbreviation Display**
- All exam abbreviations are wrapped in `<abbr>` tags with full names
- Provides better accessibility and clarity
- Hover over abbreviations to see full meaning

## File Structure

```
ubeat/
├── page.tsx              # Main login page with both forms
├── payment/
│   └── page.tsx          # Payment gateway page
└── README.md            # This file
```

## How It Works

### Standard Flow (With Exam Number)

```
Student Portal Landing
    ↓
Select UBEAT
    ↓
Enter Exam Number
    ↓
Validate & Fetch Results
    ↓
Dashboard
```

### Alternative Flow (Without Exam Number)

```
Student Portal Landing
    ↓
Select UBEAT
    ↓
Click "Don't know your exam number?"
    ↓
Fill Alternative Form (Name, School, LGA, Year)
    ↓
Proceed to Payment (₦500)
    ↓
Payment Gateway
    ↓
Payment Verification
    ↓
Search & Fetch Results
    ↓
Dashboard
```

## API Endpoints

### Standard Login
```
GET /ubeat-student/check-result/{examNo}
```

### Alternative Form (To be implemented)
```
POST /ubeat-student/search-by-details
Body: {
  fullName: string,
  schoolName: string,
  lga: string,
  examYear: string,
  paymentReference: string
}
```

### Payment Verification (To be implemented)
```
POST /ubeat-student/verify-payment
Body: {
  reference: string,
  amount: number
}
```

## Payment Integration

### Current Implementation
The payment page is currently set up with a mock/simulation flow. To integrate with a real payment gateway (Paystack, Flutterwave, etc.):

1. **Update `page.tsx`** (Alternative Form Submit):
```typescript
// Replace simulation with actual API call
const response = await fetch(`${API_BASE_URL}/payment/initialize`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 50000, // ₦500.00 in kobo
    email: 'student@example.com',
    metadata: altFormData
  })
})

const { authorization_url } = await response.json()
window.location.href = authorization_url
```

2. **Update `payment/page.tsx`**:
```typescript
// Verify payment on page load
useEffect(() => {
  const verifyPayment = async () => {
    const reference = searchParams.get('reference')
    const response = await fetch(`${API_BASE_URL}/payment/verify/${reference}`)
    const data = await response.json()
    
    if (data.status === 'success') {
      // Search for student using alternative form data
      const studentResponse = await fetch(`${API_BASE_URL}/ubeat-student/search-by-details`, {
        method: 'POST',
        body: JSON.stringify(storedFormData)
      })
      // ... handle response
    }
  }
  
  verifyPayment()
}, [])
```

## Security Considerations

1. **Payment Security**:
   - All payments must be processed through certified payment gateways
   - Never store card details
   - Use HTTPS for all transactions
   - Implement webhook verification for payment callbacks

2. **Data Privacy**:
   - Form data is temporarily stored in localStorage
   - Cleared after successful payment verification
   - Backend should validate all student details before returning results

3. **Fraud Prevention**:
   - Implement rate limiting on search endpoints
   - Log all payment transactions
   - Verify payment status before releasing results
   - Track IP addresses for suspicious activity

## Testing

### Test Data (Mock)
```typescript
{
  fullName: "John Doe",
  schoolName: "Example Primary School",
  lga: "Owerri Municipal",
  examYear: "2025"
}
```

### Expected Behaviors
1. Form validation should prevent submission with incomplete data
2. Payment gateway should redirect properly
3. Failed payments should allow retry
4. Successful payments should grant immediate access

## Future Enhancements

1. **Email Notifications**: Send payment receipts and result notifications
2. **SMS Integration**: Send exam number via SMS after payment
3. **Bulk Discount**: Offer discounts for schools purchasing multiple result access
4. **Result Download**: Allow PDF download of results after payment
5. **Payment History**: Track payment history for auditing

## Support

For technical issues or payment problems, students should contact:
- Email: support@moepse.imo.gov.ng
- Phone: [To be added]
- Office Hours: Monday - Friday, 8AM - 5PM

## Changelog

### Version 1.0.0 (2026-02-13)
- Initial release
- Standard login with exam number
- Alternative form with payment gateway
- Mock payment integration
- ABBR tags for accessibility
