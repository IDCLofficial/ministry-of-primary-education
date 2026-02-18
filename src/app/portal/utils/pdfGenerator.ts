import React from 'react'
import jsPDF from 'jspdf'

interface FAQItem {
    question: string
    answer: string
    category: string
}

interface CategoryInfo {
    [key: string]: {
        title: string
        icon: React.ComponentType<{ className?: string }>
    }
}

export const generateFAQPDF = async (faqs: FAQItem[], categoryInfo: CategoryInfo) => {
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

    addNewPageIfNeeded(30)
    yPosition += 10
    doc.setFillColor(240, 253, 244)
    doc.rect(margin, yPosition, maxWidth, 35, 'F')
    
    yPosition += 10
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Need More Help?', margin + 5, yPosition)
    
    yPosition += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text('Contact the Ministry IT Support through your LGA education office', margin + 5, yPosition)
    yPosition += 5
    doc.text('or reach out to your school administrator for assistance.', margin + 5, yPosition)

    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        )
        doc.text(
            `© ${new Date().getFullYear()} MOPSE`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
        )
    }

    doc.save('MOPSE-Portal-FAQ-User-Manual.pdf')
}
