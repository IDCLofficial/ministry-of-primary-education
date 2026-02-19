import jsPDF from 'jspdf'
import { allFAQs, categoryInfo } from '../data/faqData'

export const generateFAQPDF = () => {
    const faqs = allFAQs
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - (margin * 2)
    let yPosition = margin

    const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            doc.addPage()
            yPosition = margin
            return true
        }
        return false
    }

    const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
        doc.setFontSize(fontSize)
        const words = text.split(' ')
        const lines: string[] = []
        let currentLine = ''

        words.forEach(word => {
            const testLine = currentLine ? `${currentLine} ${word}` : word
            const textWidth = doc.getTextWidth(testLine)
            
            if (textWidth > maxWidth) {
                if (currentLine) {
                    lines.push(currentLine)
                    currentLine = word
                } else {
                    lines.push(word)
                    currentLine = ''
                }
            } else {
                currentLine = testLine
            }
        })
        
        if (currentLine) {
            lines.push(currentLine)
        }
        
        return lines
    }

    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('MOPSE Portal', margin, yPosition)
    yPosition += 10
    
    doc.setFontSize(20)
    doc.text('FAQ & User Manual', margin, yPosition)
    yPosition += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Imo State Ministry of Primary and Secondary Education', margin, yPosition)
    yPosition += 15

    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    const introLines = wrapText(
        'Complete guide to using the MOPSE School Portal. This manual covers registration, login, dashboard navigation, exam applications, and technical support.',
        maxWidth,
        11
    )
    introLines.forEach(line => {
        doc.text(line, margin, yPosition)
        yPosition += 6
    })
    yPosition += 10

    const categories = Object.keys(categoryInfo)
    
    categories.forEach((category) => {
        const categoryFAQs = faqs.filter(faq => faq.category === category)
        
        if (categoryFAQs.length === 0) return

        addNewPageIfNeeded(20)
        
        doc.setFillColor(34, 197, 94)
        doc.rect(margin, yPosition - 5, maxWidth, 10, 'F')
        
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text(categoryInfo[category].title, margin + 3, yPosition + 2)
        yPosition += 12

        categoryFAQs.forEach((faq) => {
            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(0, 0, 0)
            
            const questionLines = wrapText(faq.question, maxWidth - 10, 11)
            const answerLines = wrapText(faq.answer, maxWidth - 10, 10)
            const totalHeight = (questionLines.length * 6) + (answerLines.length * 5) + 10
            
            addNewPageIfNeeded(totalHeight)
            
            doc.setFillColor(249, 250, 251)
            doc.rect(margin, yPosition, maxWidth, totalHeight - 5, 'F')
            
            yPosition += 5
            questionLines.forEach(line => {
                doc.text(line, margin + 5, yPosition)
                yPosition += 6
            })
            
            yPosition += 2
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(60, 60, 60)
            
            answerLines.forEach(line => {
                doc.text(line, margin + 5, yPosition)
                yPosition += 5
            })
            
            yPosition += 8
        })
        
        yPosition += 5
    })
    
    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        
        // Page number centered
        const pageText = `Page ${i} of ${totalPages}`
        const textWidth = doc.getStringUnitWidth(pageText) * 8 / doc.internal.scaleFactor
        doc.text(pageText, (pageWidth - textWidth) / 2, pageHeight - 10)
        
        // Copyright on right
        const copyrightText = `© ${new Date().getFullYear()} MOPSE`
        doc.text(copyrightText, pageWidth - margin - 15, pageHeight - 10)
    }

    doc.save('MOPSE-Portal-FAQ-User-Manual.pdf')
}
