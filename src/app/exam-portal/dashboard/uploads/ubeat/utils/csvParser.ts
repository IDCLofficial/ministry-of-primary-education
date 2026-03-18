import * as XLSX from 'xlsx'

/**
 * Extract exam year from filename
 * Expected format: IMSG_EDC_UBEAT_2024_EXAM or similar patterns with year
 */
export const extractExamYearFromFilename = (filename: string): number => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(csv|xlsx|xls)$/i, '')
  
  // Split by common delimiters (underscore, hyphen, space)
  const parts = nameWithoutExt.split(/[_\-\s]+/)
  
  // Look for a 4-digit year (between 2000 and 2099)
  for (const part of parts) {
    const year = parseInt(part, 10)
    if (!isNaN(year) && year >= 2000 && year <= 2099) {
      return year
    }
  }
  
  // Default to current year if no valid year found
  return new Date().getFullYear()
}

export interface UBEATStudentRecord {
  serialNumber: number
  examNumber: string
  studentName: string
  age: number
  sex: 'male' | 'female'
  lga: string
  zone: string
  schoolName: string
  codeNo: string
  attendance: string | number
  examYear: number
  subjects: {
    mathematics: {
      ca: string
      exam: number
    }
    english: {
      ca: string
      exam: number
    }
    generalKnowledge: {
      ca: string
      exam: number
    }
    igbo: {
      ca: string
      exam: number
    }
  }
  file: {
    name: string
    size: number
  }
}

export const parseCSVFile = (file: File): Promise<UBEATStudentRecord[]> => {
  const isXLSX = file.name.toLowerCase().endsWith('.xlsx') ||
    file.name.toLowerCase().endsWith('.xls')

  // Extract exam year from filename
  const examYear = extractExamYearFromFilename(file.name)

  if (isXLSX) {
    return parseXLSXFile(file, examYear)
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const records = parseCSVText(text, { name: file.name, size: file.size }, examYear)
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

export const parseXLSXFile = (file: File, examYear: number): Promise<UBEATStudentRecord[]> => {
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
        const allRecords: UBEATStudentRecord[] = []

        // Process each sheet
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]

          // Skip empty sheets
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')
          const rowCount = range.e.r - range.s.r + 1

          if (rowCount < 3) {
            console.warn(`Skipping sheet "${sheetName}": Not enough rows (needs at least 3, has ${rowCount})`)
            return
          }

          // Convert sheet to CSV format
          const csvText = XLSX.utils.sheet_to_csv(worksheet)

          try {
            const records = parseCSVText(csvText, {
              name: `${file.name} - Sheet: ${sheetName}`,
              size: file.size
            }, examYear)

            if (records.length > 0) {
              allRecords.push(...records)
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.warn(`✗ Error parsing sheet "${sheetName}": ${errorMessage}`)
          }
        })

        if (allRecords.length === 0) {
          reject(new Error(`No valid UBEAT data found in any sheet of "${file.name}". Please ensure sheets have the correct format with 2 header rows.`))
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

export const parseCSVText = (csvText: string, file: { name: string; size: number }, examYear: number): UBEATStudentRecord[] => {
  const lines = csvText.trim().split('\n').filter(line => line.trim() !== '')

  if (lines.length < 2) {
    throw new Error(`File "${file.name}" must have at least 1 header row and one data row. Found ${lines.length} rows.`)
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

  const records: UBEATStudentRecord[] = []

  const parseLineSafe = (idx: number) => (idx >= 0 && idx < lines.length ? parseLine(lines[idx]) : [])
  const isNumeric = (v?: string) => {
    const s = (v ?? '').trim()
    if (!s) return false
    return !Number.isNaN(Number(s))
  }

  const row0 = parseLineSafe(0)
  const row1 = parseLineSafe(1)
  const row2 = parseLineSafe(2)

  // Auto-detect CSV layout by row/column shape (do NOT rely on header titles).
  // - Legacy layout: 2 header rows, data starts at line index 2, first column is numeric serial.
  // - New layout: 1 header row, data starts at line index 1, first column is candidate name (non-numeric),
  //   and columns are [name, examNo, sex, age, math(3), eng(3), gk(3), igbo(3)].
  const hasLegacyDataRow = row2.length > 0 && isNumeric(row2[0])
  const isLegacy = hasLegacyDataRow
  const dataStartRow = isLegacy ? 2 : 1
  if (isLegacy && lines.length < 3) {
    throw new Error(`File "${file.name}" appears to be the legacy UBEAT format but is missing the second header row.`)
  }

  const inferredSchoolName = isLegacy ? null : getSchoolNameFromFileMeta(file.name)

  const legacyIndices = {
    serialNo: 0,
    lga: 1,
    zone: 2,
    schoolName: 3,
    codeNo: 4,
    candidateName: 5,
    examNo: 6,
    sex: 7,
    age: 8,
    attendance: 9,
    math: { ca30: 10, ca70: 11, total: 12 },
    english: { ca30: 13, ca70: 14, total: 15 },
    generalKnowledge: { ca30: 16, ca70: 17, total: 18 },
    igbo: { ca30: 19, ca70: 20, total: 21 },
  }

  const newFormatIndices = {
    candidateName: 0,
    examNo: 1,
    sex: 2,
    age: 3,
    math: { ca30: 4, ca70: 5, total: 6 },
    english: { ca30: 7, ca70: 8, total: 9 },
    generalKnowledge: { ca30: 10, ca70: 11, total: 12 },
    igbo: { ca30: 13, ca70: 14, total: 15 },
  }

  // Parse data rows (skip detected header rows)
  for (let i = dataStartRow; i < lines.length; i++) {
    const values = parseLine(lines[i])

    if (isLegacy) {
      // Legacy cleanup: some exports insert an extra column before candidate name.
      // Keep the heuristic but scope it to legacy only.
      if ((values[legacyIndices.candidateName] ?? '').includes('20')) {
        values.splice(legacyIndices.candidateName, 1)
      }
    }
  

    // Skip empty rows
    const indices = isLegacy ? legacyIndices : newFormatIndices
    const serialIdx = isLegacy ? legacyIndices.serialNo : -1
    const isEmptyRow =
      (serialIdx === -1 || !values[serialIdx]?.trim()) &&
      !values[indices.candidateName]?.trim() &&
      !values[indices.examNo]?.trim()

    if (isEmptyRow) {
      continue
    }

    try {
      const sexValue = values[indices.sex]?.trim().toUpperCase()
      const sex = sexValue === 'F' || sexValue === 'FEMALE' ? 'female' : 'male'

      const record: UBEATStudentRecord = {
        serialNumber: isLegacy
          ? getNumberValue(values, legacyIndices.serialNo, i - (dataStartRow - 1))
          : (i - dataStartRow + 1),
        examNumber: getStringValue(values, indices.examNo, `UBEAT/${i - dataStartRow + 1}`),
        studentName: getStringValue(values, indices.candidateName, 'Unknown'),
        age: getNumberValue(values, indices.age, 0),
        sex,
        lga: isLegacy ? getStringValue(values, legacyIndices.lga, 'Unknown LGA') : 'Unknown LGA',
        zone: isLegacy ? getStringValue(values, legacyIndices.zone, 'Unknown Zone') : 'Unknown Zone',
        schoolName: isLegacy
          ? getStringValue(values, legacyIndices.schoolName, 'Unknown School')
          : (inferredSchoolName || 'Unknown School'),
        codeNo: isLegacy ? getStringValue(values, legacyIndices.codeNo, '') : '',
        attendance: isLegacy ? getAttendanceValue(values, legacyIndices.attendance) : 0,
        examYear,
        subjects: {
          mathematics: {
            ca: getStringValue(values, indices.math.ca30, '0'),
            exam: getNumberValue(values, indices.math.ca70, 0)
          },
          english: {
            ca: getStringValue(values, indices.english.ca30, '0'),
            exam: getNumberValue(values, indices.english.ca70, 0)
          },
          generalKnowledge: {
            ca: getStringValue(values, indices.generalKnowledge.ca30, '0'),
            exam: getNumberValue(values, indices.generalKnowledge.ca70, 0)
          },
          igbo: {
            ca: getStringValue(values, indices.igbo.ca30, '0'),
            exam: getNumberValue(values, indices.igbo.ca70, 0)
          }
        },
        file
      }

      records.push(record)
    } catch (error) {
      console.warn(`Error parsing row ${i + 1}:`, error)
    }
  }

  if (records.length === 0) {
    throw new Error('No valid student records found in the file')
  }

  return records
}

const getStringValue = (values: string[], index: number, defaultValue: string): string => {
  if (index >= values.length) return defaultValue
  const value = values[index]?.trim() || ''
  return value || defaultValue
}

const getNumberValue = (values: string[], index: number, defaultValue: number): number => {
  if (index >= values.length) return defaultValue
  const value = values[index]?.trim() || ''
  if (!value) return defaultValue

  // Handle "ABS" (absent) or similar markers
  if (value.toUpperCase() === 'ABS' || value.toUpperCase() === 'ABSENT') return 0

  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

const getAttendanceValue = (values: string[], index: number): string | number => {
  if (index >= values.length) return 0
  const value = values[index]?.trim() || ''
  if (!value) return 0

  // Try to parse as number first (Variation 2: numeric values like 1, 2, 3)
  const parsed = parseFloat(value)
  if (!isNaN(parsed)) return parsed

  // Return as string if it's not a number (Variation 1: text values like "PRESENT", "ABSENT")
  // This handles both CSV format variations automatically
  return value
}

const getSchoolNameFromFileMeta = (fileName: string): string => {
  // XLSX sheets are passed in as: "<original file> - Sheet: <sheetName>"
  const sheetMarker = ' - Sheet: '
  const sheetIdx = fileName.indexOf(sheetMarker)
  const raw = sheetIdx >= 0 ? fileName.slice(sheetIdx + sheetMarker.length) : fileName

  // If it's a plain filename, strip extension.
  return raw.replace(/\.(csv|xlsx|xls)$/i, '').trim()
}

export type { UBEATStudentRecord as StudentRecord }
