export interface SignatureImageConfig {
    path: string
    scale?: number  // Scale factor (e.g., 0.15 = 15% of canvas width)
}

export const COMMISSIONERS_SIGNATURES: Record<number, SignatureImageConfig> = {
    2013: { path: "/images/named signatures/mrs-c-p-amadi-sign.png", scale: 0.25 },
    2014: { path: "/images/named signatures/mrs-c-p-amadi-sign.png", scale: 0.25 },
    2015: { path: "/images/named signatures/j-n-nwachukwu-sign.png", scale: 0.20 },
    2016: { path: "/images/named signatures/j-n-nwachukwu-sign.png", scale: 0.20 },
    2017: { path: "/images/named signatures/j-n-nwachukwu-sign.png", scale: 0.20 },
    2018: { path: "/images/named signatures/j-n-nwachukwu-sign.png", scale: 0.20 },
    2019: { path: "/images/named signatures/j-n-nwachukwu-sign.png", scale: 0.20 },
    2020: { path: "/images/named signatures/prof-b-t-o-ikegwuoha.png", scale: 0.25 },
    2021: { path: "/images/named signatures/prof-b-t-o-ikegwuoha.png", scale: 0.20 },
    2022: { path: "/images/named signatures/prof-okorondu-ifunanya.png", scale: 0.20 },
    2023: { path: "/images/named signatures/prof-johndliff-nwadike.png", scale: 0.20 },
    2024: { path: "/images/named signatures/prof-johndliff-nwadike.png", scale: 0.20 },
    2025: { path: "/images/named signatures/prof-b-t-o-ikegwuoha.png", scale: 0.25 },
    2026: { path: "/images/named signatures/prof-b-t-o-ikegwuoha.png", scale: 0.25 },
}

export const DIRECTORS_SIGNATURES: Record<number, SignatureImageConfig> = {
    // L.I.C Okereke sign missing
    2013: { path: "/images/named signatures/prof-adaobi-obasi-sign.png", scale: 0.20 },
    2014: { path: "/images/named signatures/chief-mrs-uche-ejiogu-sign.png", scale: 0.20 },
    // 2015: { path: "/images/named signatures/j-n-nwachukwu-sign.png", scale: 0.20 },
    2016: { path: "/images/named signatures/dr-mrs-getrude-oduka-sign.png", scale: 0.20 },
    2017: { path: "/images/named signatures/dr-mrs-getrude-oduka-sign.png", scale: 0.20 },
    2018: { path: "/images/named signatures/dr-mrs-getrude-oduka-sign.png", scale: 0.20 },
    2019: { path: "/images/named signatures/prof-florence-emenalo-sign.png", scale: 0.25 },
    2020: { path: "/images/named signatures/l-i-c-okereke-sign.png", scale: 0.20 },
    2021: { path: "/images/named signatures/eleberi-patricia-a-sign.png", scale: 0.17 },
    2022: { path: "/images/named signatures/eleberi-patricia-a-sign.png", scale: 0.17 },
    2023: { path: "/images/named signatures/eleberi-patricia-a-sign.png", scale: 0.17 },
    2024: { path: "/images/named signatures/eleberi-patricia-a-sign.png", scale: 0.17 },
    2025: { path: "/images/named signatures/eleberi-patricia-a-sign.png", scale: 0.17 },
    2026: { path: "/images/named signatures/nwangu-c-r-sign.png", scale: 0.20 },
}