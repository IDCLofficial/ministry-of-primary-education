/**
 * Generate and download WAEC Approval Certificate as PDF
 * 
 * @param {Object} data - Certificate data
 * @param {string} data.schoolName - Name of the school
 * @param {number} data.studentsApproved - Number of students approved
 * @param {string} data.examSession - Exam session (e.g., "May/June 2026")
 * @param {string} data.approvalId - Unique approval ID
 * @param {string} data.issueDate - Date issued (optional, defaults to today)
 */
async function generateCertificatePDF(data) {
    const {
        schoolName = 'Community Secondary School, Owerri',
        studentsApproved = 150,
        examSession = 'May/June 2026',
        approvalId = 'WAEC-IMO-2026-001',
        issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } = data;

    // Create certificate HTML
    const certificateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            background: linear-gradient(135deg, #667eea 0, #764ba2 100);
            min-height: 100vmin;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .certificate-container {
            width: 1000px;
            height: 707px;
            background: linear-gradient(to bottom right, #fef9e7, #fdebd0);
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .border-pattern {
            position: absolute;
            inset: 20px;
            border: 3px solid #c19a6b;
            pointer-events: none;
        }

        .border-pattern::before,
        .border-pattern::after {
            content: '';
            position: absolute;
            background: linear-gradient(45deg, #d4af37, #f4e4c1, #d4af37);
        }

        .border-pattern::before {
            top: -3px;
            left: -3px;
            right: -3px;
            height: 3px;
        }

        .border-pattern::after {
            left: -3px;
            top: -3px;
            bottom: -3px;
            width: 3px;
        }

        .corner-ornament {
            position: absolute;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, #d4af37 0, transparent 70);
            opacity: 0.3;
        }

        .corner-ornament.top-left {
            top: 0;
            left: 0;
            border-radius: 0 0 100px 0;
        }

        .corner-ornament.top-right {
            top: 0;
            right: 0;
            border-radius: 0 0 0 100px;
        }

        .corner-ornament.bottom-left {
            bottom: 0;
            left: 0;
            border-radius: 0 100px 0 0;
        }

        .corner-ornament.bottom-right {
            bottom: 0;
            right: 0;
            border-radius: 100px 0 0 0;
        }

        .decorative-circle {
            position: absolute;
            border-radius: 50%;
            border: 2px solid #d4af37;
            opacity: 0.2;
        }

        .circle-1 {
            width: 300px;
            height: 300px;
            top: -100px;
            right: -100px;
        }

        .circle-2 {
            width: 200px;
            height: 200px;
            bottom: -50px;
            left: -50px;
        }

        .circle-3 {
            width: 150px;
            height: 150px;
            top: 353px;
            left: -75px;
        }

        .certificate-content {
            position: relative;
            z-index: 10;
            padding: 4vmin 5vmin;
            height: 707px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .header {
            text-align: center;
        }

        .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
            margin-bottom: 20px;
        }

        .logo {
            width: 6vmin;
            height: 6vmin;
            object-fit: contain;
        }

        .ministry-name {
            font-size: 1.4vmin;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 0.15vmin;
            margin-bottom: 0.5vmin;
        }

        .state-name {
            font-size: 1.1vmin;
            color: #5d6d7e;
            font-style: italic;
        }

        .certificate-title {
            font-size: 4vmin;
            font-weight: bold;
            color: #1e3a5f;
            text-transform: uppercase;
            letter-spacing: 0.3vmin;
            margin: 2vmin 0 1.5vmin;
            text-shadow: 0.15vmin 0.15vmin 0.3vmin rgba(0, 0, 0, 0.1);
            background: linear-gradient(135deg, #1e3a5f, #4a6fa5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .certificate-subtitle {
            font-size: 1.3vmin;
            color: #7f8c8d;
            font-style: italic;
            margin-bottom: 1vmin;
        }

        .divider {
            width: 15vmin;
            height: 0.25vmin;
            background: linear-gradient(to right, transparent, #d4af37, transparent);
            margin: 1.5vmin auto;
        }

        .body {
            text-align: center;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .presented-to {
            font-size: 1.4vmin;
            color: #34495e;
            margin-bottom: 1.2vmin;
        }

        .recipient-name {
            font-size: 3.2vmin;
            font-weight: bold;
            color: #1e3a5f;
            margin: 1.5vmin 0;
            padding: 1.2vmin 3vmin;
            border-bottom: 0.25vmin solid #d4af37;
            display: inline-block;
            text-transform: capitalize;
        }

        .achievement-text {
            font-size: 1.2vmin;
            color: #5d6d7e;
            line-height: 1.6;
            max-width: 900px;
            margin: 2vmin auto;
            padding: 0 2vmin;
        }

        .achievement-text strong {
            color: #1e3a5f;
            font-weight: bold;
        }

        .completion-details {
            display: flex;
            justify-content: center;
            gap: 4vmin;
            margin-top: 2vmin;
        }

        .detail-item {
            text-align: center;
        }

        .detail-label {
            font-size: 0.9vmin;
            color: #95a5a6;
            text-transform: uppercase;
            letter-spacing: 0.08vmin;
            margin-bottom: 0.4vmin;
        }

        .detail-value {
            font-size: 1.3vmin;
            color: #2c3e50;
            font-weight: bold;
        }

        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 3vmin;
        }

        .signature-block {
            text-align: center;
            flex: 1;
        }

        .signature-image {
            width: 12vmin;
            height: 5vmin;
            object-fit: contain;
            margin-bottom: 0.8vmin;
        }

        .signature-line {
            width: 15vmin;
            height: 0.15vmin;
            background: #2c3e50;
            margin: 0 auto 0.8vmin;
        }

        .signature-name {
            font-size: 1.1vmin;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 0.25vmin;
        }

        .signature-title {
            font-size: 0.95vmin;
            color: #7f8c8d;
            font-style: italic;
        }

        .date-block {
            text-align: center;
            flex: 1;
        }

        .date-label {
            font-size: 0.9vmin;
            color: #95a5a6;
            text-transform: uppercase;
            letter-spacing: 0.08vmin;
            margin-bottom: 0.4vmin;
        }

        .date-value {
            font-size: 1.3vmin;
            color: #2c3e50;
            font-weight: bold;
        }

        .official-seal {
            position: absolute;
            bottom: 60px;
            right: 80px;
            width: 100px;
            height: 100px;
            border-radius: 50px;
            border: 3px solid #d4af37;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.1), transparent);
            transform: rotate(-15deg);
        }

        .seal-text {
            text-align: center;
            font-size: 10px;
            color: #d4af37;
            font-weight: bold;
            text-transform: uppercase;
            line-height: 1.2;
        }

        .watermark {
            position: absolute;
            top: 353px;
            left: 500px;
            transform: translate(-50px, -50px) rotate(-45deg);
            font-size: 120px;
            color: rgba(212, 175, 55, 0.05);
            font-weight: bold;
            pointer-events: none;
            z-index: 1;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="corner-ornament top-left"></div>
        <div class="corner-ornament top-right"></div>
        <div class="corner-ornament bottom-left"></div>
        <div class="corner-ornament bottom-right"></div>
        
        <div class="decorative-circle circle-1"></div>
        <div class="decorative-circle circle-2"></div>
        <div class="decorative-circle circle-3"></div>
        
        <div class="border-pattern"></div>
        
        <div class="watermark">CERTIFIED</div>

        <div class="certificate-content">
            <div class="header">
                <div class="logo-container">
                    <img src="images/ministry-logo.png" alt="Ministry Logo" class="logo">
                </div>
                <div class="ministry-name">Ministry of Primary & Secondary Education</div>
                <div class="state-name">Imo State Government, Nigeria</div>
                <h1 class="certificate-title">Certificate</h1>
                <p class="certificate-subtitle">of Approval</p>
                <div class="divider"></div>
            </div>

            <div class="body">
                <p class="presented-to">This certificate is hereby issued to</p>
                
                <div class="recipient-name">${schoolName}</div>
                
                <p class="achievement-text">
                    For successful submission and approval of <strong>WAEC Student Registration</strong>
                    for the upcoming examination. The Ministry hereby certifies that all submitted
                    student records have been reviewed, verified, and approved for registration
                    with the West African Examinations Council (WAEC).
                </p>

                <div class="completion-details">
                    <div class="detail-item">
                        <div class="detail-label">Students Approved</div>
                        <div class="detail-value">${studentsApproved}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Exam Session</div>
                        <div class="detail-value">${examSession}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Approval ID</div>
                        <div class="detail-value">${approvalId}</div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <div class="signature-block">
                    <img src="images/signature.png" alt="Signature" class="signature-image">
                    <div class="signature-line"></div>
                    <div class="signature-name">Prof. Bernard Thompson Ikegwuoha</div>
                    <div class="signature-title">Honorable Commissioner</div>
                    <div class="signature-title">Ministry of Primary & Secondary Education</div>
                </div>

                <div class="date-block">
                    <div class="date-label">Date Issued</div>
                    <div class="date-value">${issueDate}</div>
                </div>
            </div>
        </div>

        <div class="official-seal">
            <div class="seal-text">
                Official<br>Seal<br>Imo State
            </div>
        </div>
    </div>
</body>
</html>`;

    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.innerHTML = certificateHTML;
    document.body.appendChild(container);

    try {
        // Wait for images to load
        const images = container.querySelectorAll('img');
        await Promise.all(
            Array.from(images).map(img => {
                return new Promise((resolve, reject) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = resolve;
                        img.onerror = reject;
                    }
                });
            })
        );

        // Get the certificate element
        const certificateElement = container.querySelector('.certificate-container');
        
        if (!certificateElement) {
            throw new Error('Certificate element not found');
        }

        // Import html2canvas and jsPDF dynamically
        const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
        const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm');

        // Generate canvas
        const canvas = await html2canvas(certificateElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#fef9e7',
            allowTaint: true,
            foreignObjectRendering: false
        });

        // Convert to PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Generate filename
        const sanitizedSchoolName = schoolName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `WAEC_Approval_Certificate_${sanitizedSchoolName}_${approvalId}.pdf`;
        
        // Download
        pdf.save(filename);

        console.log('Certificate PDF generated successfully!');
        return { success: true, filename };

    } catch (error) {
        console.error('Error generating certificate PDF:', error);
        throw error;
    } finally {
        // Clean up
        document.body.removeChild(container);
    }
}

// Example usage:
// generateCertificatePDF({
//     schoolName: 'Community Secondary School, Owerri',
//     studentsApproved: 150,
//     examSession: 'May/June 2026',
//     approvalId: 'WAEC-IMO-2026-001'
// });

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = generateCertificatePDF;
}
