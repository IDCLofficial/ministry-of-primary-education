interface StudentRecord {
  schoolName: string
  serialNo: number
  name: string
  examNo: string
  sex: "Male" | "Female"
  age: number
  englishStudies: number
  mathematics: number
  basicScience: number
  christianReligiousStudies: number
  nationalValues: number
  culturalAndCreativeArts: number
  businessStudies: number
  history: number
  igbo: number
  hausa: number
  yoruba: number
  preVocationalStudies: number
  frenchLanguage: number
  lga: string
}

export const parseCSVFile = (file: File): Promise<StudentRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lga = file.name.split(" - ")[1];
        const records = parseCSVText(text, lga)
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

export const parseCSVText = (csvText: string, lga: string): StudentRecord[] => {
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

  const columnIndices = {
    schoolName: 0,      // First column
    serialNo: 1,        // Second column  
    name: 2,            // Third column
    examNo: 3,          // Fourth column
    sex: 4,             // Fifth column
    age: 5,             // Sixth column
    englishStudies: 6,  // Seventh column
    mathematics: 7,     // Eighth column
    basicScience: 8,    // Ninth column
    christianReligiousStudies: 9,  // Tenth column
    nationalValues: 10, // Eleventh column
    culturalAndCreativeArts: 11,   // Twelfth column
    businessStudies: 12,           // Thirteenth column
    history: 13,                   // Fourteenth column
    igbo: 14,                      // Fifteenth column
    hausa: 15,                     // Sixteenth column
    yoruba: 16,                    // Seventeenth column
    preVocationalStudies: 17,      // Eighteenth column
    frenchLanguage: 18             // Nineteenth column
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])

    // Skip rows where the first 5 columns (indices 0-4) are empty
    const isEmptyRow = (values[0]?.trim() === 'Unknown School' || values[0]?.trim() === '') && 
                      (values[2]?.trim() === 'Unknown' || values[2]?.trim() === '')
    
    if (isEmptyRow) {
      continue // Skip this row
    }

    try {
      const record: StudentRecord = {
        schoolName: getStringValue(values, columnIndices.schoolName, 'Unknown School'),
        serialNo: i+1,
        name: getStringValue(values, columnIndices.name, 'Unknown'),
        examNo: getStringValue(values, columnIndices.examNo, `EXAM${i.toString().padStart(3, '0')}`),
        sex: getSexValue(values, columnIndices.sex),
        age: getNumberValue(values, columnIndices.age, 0),
        englishStudies: getNumberValue(values, columnIndices.englishStudies, 0),
        mathematics: getNumberValue(values, columnIndices.mathematics, 0),
        basicScience: getNumberValue(values, columnIndices.basicScience, 0),
        christianReligiousStudies: getNumberValue(values, columnIndices.christianReligiousStudies, 0),
        nationalValues: getNumberValue(values, columnIndices.nationalValues, 0),
        culturalAndCreativeArts: getNumberValue(values, columnIndices.culturalAndCreativeArts, 0),
        businessStudies: getNumberValue(values, columnIndices.businessStudies, 0),
        history: getNumberValue(values, columnIndices.history, 0),
        igbo: getNumberValue(values, columnIndices.igbo, 0),
        hausa: getNumberValue(values, columnIndices.hausa, 0),
        yoruba: getNumberValue(values, columnIndices.yoruba, 0),
        preVocationalStudies: getNumberValue(values, columnIndices.preVocationalStudies, 0),
        frenchLanguage: getNumberValue(values, columnIndices.frenchLanguage, 0),
        lga: lga
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

const getNumberValue = (values: string[], index: number | undefined, defaultValue: number): number => {
  if (index === undefined || index >= values.length) return defaultValue
  const value = values[index]?.trim() || ''
  if (!value) return defaultValue
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

const getSexValue = (values: string[], index: number | undefined): "Male" | "Female" => {
  if (index === undefined || index >= values.length) return "Male"
  const value = values[index]?.trim().toLowerCase() || ''
  if (value.startsWith('f') || value === 'female') return "Female"
  return "Male"
}

export type { StudentRecord }