export interface SignatureImageConfig {
    path: string
    scale?: number  // Scale factor (e.g., 0.15 = 15% of canvas width)
}

export const COMMISSIONERS_SIGNATURES: Record<number, SignatureImageConfig> = {
    2020: { path: "/images/named signatures/prof-b-t-o-ikegwuoha.png", scale: 0.25 },
    // Ibeagi P.N sign missing
    2021: { path: "/images/named signatures/", scale: 0.20 },
    // Prof Okorondu Ifunanya sign missing
    2022: { path: "/images/named signatures/", scale: 0.20 },
    2023: { path: "/images/named signatures/prof-johndliff-nwadike.png", scale: 0.20 },
    2024: { path: "/images/named signatures/prof-johndliff-nwadike.png", scale: 0.20 },
    2025: { path: "/images/named signatures/prof-b-t-o-ikegwuoha.png", scale: 0.25 },
    2026: { path: "/images/named signatures/prof-b-t-o-ikegwuoha.png", scale: 0.25 },
}

export const DIRECTORS_SIGNATURES: Record<number, SignatureImageConfig> = {
    // L.I.C Okereke sign missing
    2020: { path: "/images/named signatures/", scale: 0.20 },
    2021: { path: "/images/named signatures/eleberi-patricia-a-sign.png", scale: 0.17 },
    2022: { path: "/images/named signatures/eleberi-patricia-a-sign.png", scale: 0.17 },
    2023: { path: "/images/named signatures/eleberi-patricia-a-sign.png", scale: 0.17 },
    2024: { path: "/images/named signatures/eleberi-patricia-a-sign.png", scale: 0.17 },
    2025: { path: "/images/named signatures/eleberi-patricia-a-sign.png", scale: 0.17 },
    2026: { path: "/images/named signatures/nwangu-c-r-sign.png", scale: 0.20 },
}