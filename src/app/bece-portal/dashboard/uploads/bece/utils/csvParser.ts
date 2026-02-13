import * as XLSX from 'xlsx'

interface StudentRecord {
  schoolName: string
  serialNo: number
  name: string
  examNo: string
  englishStudies: number
  mathematics: number
  basicScience: number
  christianReligiousStudies: number
  nationalValues: number
  culturalAndCreativeArts: number
  businessStudies: number
  igbo: number
  preVocationalStudies: number
  lga: string
  file: {
    name: string,
    size: number,
  }
}

export const parseCSVFile = (file: File): Promise<StudentRecord[]> => {
  // Check if file is XLSX
  const isXLSX = file.name.toLowerCase().endsWith('.xlsx')
  
  if (isXLSX) {
    return parseXLSXFile(file)
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        // Extract LGA and school name from filename
        // Format: "ABOH MBAISE 2025 BECE - EXCELLENCE ACADEMY.csv"
        const fileNameParts = file.name.replace('.csv', '').split(' - ')
        const lga = fileNameParts[0]?.replace(' 2025 BECE', '').trim() || 'Unknown LGA'
        const schoolName = fileNameParts[1]?.trim() || 'Unknown School'
        
        const records = parseCSVText(text, lga, schoolName, {name: file.name, size: file.size})
        resolve(records)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

export const parseXLSXFile = (file: File): Promise<StudentRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error('Failed to read file'))
          return
        }

        const workbook = XLSX.read(data, { type: 'array' })
        const allRecords: StudentRecord[] = []

        // Extract LGA from filename
        // Format: "ABOH MBAISE 2025 BECE - EXCELLENCE ACADEMY.xlsx" or similar
        const fileNameParts = file.name.replace(/\.(xlsx|xls)$/i, '').split(' - ')
        const lga = fileNameParts[0]?.replace(' 2025 BECE', '').trim() || 'Unknown LGA'

        // Process each sheet
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          
          // Convert sheet to CSV format
          const csvText = XLSX.utils.sheet_to_csv(worksheet)
          
          // Use sheet name as school name if it's not empty
          // Otherwise, try to extract from filename
          const schoolName = sheetName.trim() || fileNameParts[1]?.trim() || 'Unknown School'
          
          try {
            const records = parseCSVText(csvText, lga, schoolName, {
              name: `${file.name} - ${sheetName}`,
              size: file.size
            })
            allRecords.push(...records)
          } catch (error) {
            console.warn(`Error parsing sheet "${sheetName}":`, error)
          }
        })

        if (allRecords.length === 0) {
          reject(new Error('No valid data found in any sheet'))
          return
        }

        resolve(allRecords)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

export const parseCSVText = (csvText: string, lga: string, schoolName: string, file: {name: string, size: number}): StudentRecord[] => {
  const lines = csvText.trim().split('\n').filter(line => line.trim() !== '')

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row')
  }

  // Parse CSV line handling quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const records: StudentRecord[] = []

  // New CSV structure:
  // CANDIDATES NAME, CANDIDATE EXAM NUMBER, ENGLISH LANGUAGE, MATHEMATICS, 
  // BASIC SCIENCE AND TECHNOLOGY, CHRISTIAN RELIGIOUS KNOWLEDGE, NATIONAL VALUES,
  // CULTURAL AND CREATIVE ARTS, BUSINESS STUDIES, IGBO LANGUAGE, PRE-VOCATIONAL STUDIES
  const columnIndices = {
    name: 0,                       // First column
    examNo: 1,                     // Second column
    englishStudies: 2,             // Third column
    mathematics: 3,                // Fourth column
    basicScience: 4,               // Fifth column
    christianReligiousStudies: 5,  // Sixth column
    nationalValues: 6,             // Seventh column
    culturalAndCreativeArts: 7,    // Eighth column
    businessStudies: 8,            // Ninth column
    igbo: 9,                       // Tenth column
    preVocationalStudies: 10       // Eleventh column
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])

    // Skip empty rows
    const isEmptyRow = values[0]?.trim() === '' && values[1]?.trim() === ''
    
    if (isEmptyRow) {
      continue
    }

    try {
      const record: StudentRecord = {
        schoolName: schoolName,
        serialNo: i,
        name: getStringValue(values, columnIndices.name, 'Unknown'),
        examNo: getStringValue(values, columnIndices.examNo, `${i}`),
        englishStudies: getNumberValueOrAbsent(values, columnIndices.englishStudies, 0),
        mathematics: getNumberValueOrAbsent(values, columnIndices.mathematics, 0),
        basicScience: getNumberValueOrAbsent(values, columnIndices.basicScience, 0),
        christianReligiousStudies: getNumberValueOrAbsent(values, columnIndices.christianReligiousStudies, 0),
        nationalValues: getNumberValueOrAbsent(values, columnIndices.nationalValues, 0),
        culturalAndCreativeArts: getNumberValueOrAbsent(values, columnIndices.culturalAndCreativeArts, 0),
        businessStudies: getNumberValueOrAbsent(values, columnIndices.businessStudies, 0),
        igbo: getNumberValueOrAbsent(values, columnIndices.igbo, 0),
        preVocationalStudies: getNumberValueOrAbsent(values, columnIndices.preVocationalStudies, 0),
        lga: lga,
        file: file
      }

      records.push(record)
    } catch (error) {
      console.warn(`Error parsing row ${i + 1}:`, error)
    }
  }

  return records
}

const getStringValue = (values: string[], index: number | undefined, defaultValue: string): string => {
  if (index === undefined || index >= values.length) return defaultValue
  const value = values[index]?.trim() || ''
  return value || defaultValue
}

const getNumberValueOrAbsent = (values: string[], index: number | undefined, defaultValue: number): number => {
  if (index === undefined || index >= values.length) return defaultValue
  const value = values[index]?.trim().toUpperCase() || ''
  if (!value) return defaultValue
  // Handle "ABS" (absent) as 0
  if (value === 'ABS' || value === 'ABSENT') return 0
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

export type { StudentRecord }
