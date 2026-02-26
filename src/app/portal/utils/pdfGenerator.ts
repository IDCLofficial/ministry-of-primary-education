import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { allFAQs, categoryInfo } from '../data/faqData'
import { getExamById } from '../dashboard/[schoolCode]/types'
import fs from 'fs'
import font from './constants/font'

interface Student {
    id: string
    studentId?: string
    fullName: string
    gender: 'Male' | 'Female'
    class: string
    examYear: number
}

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

    // Helper function to parse FAQ answers with numbered lists
    const parseAnswer = (answer: string) => {
        const hasNumberedList = /\(\d+\)/.test(answer)
        
        if (!hasNumberedList) {
            return { type: 'text' as const, content: answer }
        }
        
        const parts = answer.split(/(?=\(\d+\))/)
        const intro = parts[0].trim()
        const items = parts.slice(1).map(part => {
            const match = part.match(/^\((\d+)\)\s*([\s\S]+)$/)
            if (match) {
                return { number: match[1], text: match[2].trim() }
            }
            return null
        }).filter((item): item is { number: string; text: string } => item !== null)
        
        return { type: 'list' as const, intro, items }
    }

    doc.addFileToVFS("Roboto-Regular.ttf", font);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

    doc.setFontSize(24)
    doc.setFont('Roboto', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('MOPSE Portal', margin, yPosition)
    yPosition += 10

    doc.setFontSize(20)
    doc.text('FAQ & User Manual', margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont('Roboto', 'normal')
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
        doc.setFont('Roboto', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text(categoryInfo[category].title, margin + 3, yPosition + 2)
        yPosition += 12

        categoryFAQs.forEach((faq) => {
            doc.setFontSize(11)
            doc.setFont('Roboto', 'bold')
            doc.setTextColor(0, 0, 0)

            const questionLines = wrapText(faq.question, maxWidth - 10, 11)
            const parsedAnswer = parseAnswer(faq.answer)
            
            // Calculate total height based on answer type
            let totalHeight = (questionLines.length * 6) + 10
            
            if (parsedAnswer.type === 'text') {
                const answerLines = wrapText(parsedAnswer.content, maxWidth - 10, 10)
                totalHeight += (answerLines.length * 5) + 2
            } else {
                // For lists: intro + items with bullet points
                if (parsedAnswer.intro) {
                    const introLines = wrapText(parsedAnswer.intro, maxWidth - 10, 10)
                    totalHeight += (introLines.length * 5) + 3
                }
                parsedAnswer.items.forEach(item => {
                    const itemLines = wrapText(item.text, maxWidth - 20, 10)
                    totalHeight += (itemLines.length * 5.5) + 2
                })
                totalHeight += 3
            }

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
            doc.setFont('Roboto', 'normal')
            doc.setTextColor(60, 60, 60)

            if (parsedAnswer.type === 'text') {
                const answerLines = wrapText(parsedAnswer.content, maxWidth - 10, 10)
                answerLines.forEach(line => {
                    doc.text(line, margin + 5, yPosition)
                    yPosition += 5
                })
            } else {
                // Render intro if present
                if (parsedAnswer.intro) {
                    const introLines = wrapText(parsedAnswer.intro, maxWidth - 10, 10)
                    introLines.forEach(line => {
                        doc.text(line, margin + 5, yPosition)
                        yPosition += 5
                    })
                    yPosition += 3
                }
                
                // Render list items with bullet points
                doc.setTextColor(34, 197, 94) // Green color for bullets
                parsedAnswer.items.forEach((item, idx) => {
                    const itemLines = wrapText(item.text, maxWidth - 20, 10)
                    
                    // Draw bullet point
                    doc.circle(margin + 8, yPosition - 1.5, 0.8, 'F')
                    
                    // Draw item text
                    doc.setTextColor(60, 60, 60)
                    itemLines.forEach((line, lineIdx) => {
                        doc.text(line, margin + 12, yPosition)
                        yPosition += 5.5
                    })
                    
                    // Add spacing between items
                    if (idx < parsedAnswer.items.length - 1) {
                        yPosition += 1
                    }
                    
                    doc.setTextColor(34, 197, 94) // Reset for next bullet
                })
            }

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

export const generateStudentListPDF = (students: Student[], examType: string, schoolName: string) => {
    const examTypeData = getExamById(examType === "Common-entrance" ? "CESS" : examType)
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20

    // Header
    doc.setFontSize(12)
    doc.setFont('Roboto', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Onboarded Student List', margin, 20)

    // Exam details
    doc.setFontSize(16)
    doc.setTextColor(34, 197, 94)
    doc.text(`${examTypeData?.name || examType}`, margin, 28)

    doc.setFontSize(11)
    doc.setFont('Roboto', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Class: ${examTypeData?.classFull || examTypeData?.class || 'N/A'}`, margin, 36)

    // School and student count
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.setFont('Roboto', 'bold')
    doc.text(`School: ${schoolName}`, margin, 43)
    doc.setFont('Roboto', 'normal')
    doc.text(`Total Students: ${students.length}`, margin, 50)

    // Table data
    const tableData = students.map((student, index) => [
        (index + 1).toString(),
        student.studentId || 'N/A',
        student.fullName,
        student.gender,
        student.class,
        student.examYear.toString()
    ])

    // Generate table using autoTable
    autoTable(doc, {
        head: [['#', 'Student ID', 'Full Name', 'Gender', 'Class', 'Exam Year']],
        body: tableData,
        startY: 62,
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [34, 197, 94],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { halign: 'left', cellWidth: 35 },
            2: { halign: 'left', cellWidth: 60 },
            3: { halign: 'left', cellWidth: 22 },
            4: { halign: 'left', cellWidth: 20 },
            5: { halign: 'left', cellWidth: 25 }
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251]
        },
        didDrawPage: (data: { pageNumber: number }) => {
            // Footer
            const pageCount = doc.internal.pages.length - 1
            const currentPage = data.pageNumber

            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)

            // Generated date - bottom left
            const generatedText = `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
            doc.text(generatedText, margin, pageHeight - 10)

            // Page number - center
            const pageText = `Page ${currentPage} of ${pageCount}`
            const textWidth = doc.getStringUnitWidth(pageText) * 8 / doc.internal.scaleFactor
            doc.text(pageText, (pageWidth - textWidth) / 2, pageHeight - 10)

            // Copyright - bottom right
            const copyrightText = `© ${new Date().getFullYear()} MOPSE`
            const copyrightWidth = doc.getStringUnitWidth(copyrightText) * 8 / doc.internal.scaleFactor
            doc.text(copyrightText, pageWidth - margin - copyrightWidth, pageHeight - 10)
        }
    })

    // Save the PDF
    const fileName = `${examType}-Student-List-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
}
