# UBEAT Upload - API Integration Guide

## 📡 API Endpoint

**URL:** `/ubeat/upload`  
**Method:** `POST`  
**Content-Type:** `application/json`

## 🔄 Data Transformation Flow

### Step 1: CSV Input Format
```csv
S/NO.,LGA,ZONE,SCHOOL NAME,CODE NO.,CANDIDATE'S NAME,EXAM NO.,SEX,AGE,ATTENDANCE,MATHEMATICS,,,ENGLISH LANGUAGE,,,GENERAL KNOWLEDGE,,,IGBO,,
,,,,,,,,,,CAS-30%,CAS-70%,TOTAL,CAS-30%,CAS-70%,TOTAL,CAS-30%,CAS-70%,TOTAL,CAS-30%,CAS-70%,TOTAL
1,IHITTE UBOMA,OKIGWE,CENTRAL SCHOOL AMAINYI,IB/014,AKINBOLA ELIZABETH OMOBA,IB/014/0391,F,13,1,27,37,64,28,42,76,29,54,83,26,45,71
```

### Step 2: Parsed Data Structure
```typescript
interface UBEATStudentRecord {
  serialNumber: number           // 1
  examNumber: string             // "IB/014/0391"
  studentName: string            // "AKINBOLA ELIZABETH OMOBA"
  age: number                    // 13
  sex: 'male' | 'female'        // "female"
  lga: string                    // "IHITTE UBOMA"
  zone: string                   // "OKIGWE"
  schoolName: string             // "CENTRAL SCHOOL AMAINYI"
  codeNo: string                 // "IB/014"
  attendance: string | number    // 1
  subjects: {
    mathematics: {
      ca: string    // "27" (CAS-30%)
      exam: number  // 37   (CAS-70%)
    }
    english: {
      ca: string    // "28"
      exam: number  // 42
    }
    generalKnowledge: {
      ca: string    // "29"
      exam: number  // 54
    }
    igbo: {
      ca: string    // "26"
      exam: number  // 45
    }
  }
}
```

### Step 3: API Payload Structure
```json
{
  "result": [
    {
      "lga": "IHITTE UBOMA",
      "schoolName": "CENTRAL SCHOOL AMAINYI",
      "students": [
        {
          "serialNumber": 1,
          "examNumber": "IB/014/0391",
          "studentName": "AKINBOLA ELIZABETH OMOBA",
          "age": 13,
          "sex": "female",
          "subjects": {
            "mathematics": {
              "ca": 27,
              "exam": 37
            },
            "english": {
              "ca": 28,
              "exam": 42
            },
            "generalKnowledge": {
              "ca": 29,
              "exam": 54
            },
            "igbo": {
              "ca": 26,
              "exam": 45
            }
          }
        }
      ]
    }
  ]
}
```

## 🔧 Transformation Logic

### Direct Subject Mapping
The subjects are sent with their original keys and CA/Exam values:
```typescript
subjects: {
  mathematics: {
    ca: number,    // CAS-30% (max 30) - converted from string to number
    exam: number   // CAS-70% (max 70)
  },
  english: { ca: number, exam: number },
  generalKnowledge: { ca: number, exam: number },
  igbo: { ca: number, exam: number }
}
```

### CA String to Number Conversion
The CA value is parsed from CSV as string, then converted to number for API:
```typescript
ca: parseFloat(student.subjects.mathematics.ca) || 0
```

### Example Transformation
**Input (CSV):**
- Mathematics: ca="27", exam=37

**Output (API):**
```json
{
  "mathematics": {
    "ca": 27,
    "exam": 37
  }
}
```

## 📋 Complete Transformation Code

```typescript
const results = Object.entries(schoolGroups).map(([schoolName, students]) => ({
  lga: students[0]?.lga,
  schoolName,
  students: students.map(student => ({
    serialNumber: student.serialNumber,
    examNumber: student.examNumber,
    studentName: student.studentName,
    age: student.age,
    sex: student.sex,
    subjects: {
      mathematics: {
        ca: parseFloat(student.subjects.mathematics.ca) || 0,
        exam: student.subjects.mathematics.exam
      },
      english: {
        ca: parseFloat(student.subjects.english.ca) || 0,
        exam: student.subjects.english.exam
      },
      generalKnowledge: {
        ca: parseFloat(student.subjects.generalKnowledge.ca) || 0,
        exam: student.subjects.generalKnowledge.exam
      },
      igbo: {
        ca: parseFloat(student.subjects.igbo.ca) || 0,
        exam: student.subjects.igbo.exam
      }
    }
  }))
}))
```

## 🎯 API Call

```typescript
import { useUploadUBEATResultsMutation } from '../../../../store/api/authApi'

const [uploadUBEATResults] = useUploadUBEATResultsMutation()

await uploadUBEATResults({ result: results }).unwrap()
```

## ✅ Success Response

```json
{
  "message": "Successfully uploaded UBEAT results",
  "uploadedCount": 150
}
```

## ❌ Error Handling

The implementation handles errors gracefully:
```typescript
try {
  await uploadUBEATResults({ result: results }).unwrap()
  toast.success(`Successfully saved ${data.length} UBEAT records`)
  router.push('/bece-portal/dashboard/schools')
} catch (error) {
  console.error('Error saving UBEAT data:', error)
  toast.error('Failed to save UBEAT data to database')
}
```

## 📊 Data Validation

### CSV Parsing Validation
- ✅ Minimum 3 rows required (2 headers + 1 data)
- ✅ CA score range: 0-30
- ✅ Exam score range: 0-70
- ✅ Total score: Automatically calculated (CA + Exam)
- ✅ Sex values: M/F or Male/Female (case-insensitive)
- ✅ Empty rows are skipped

### XLSX Multi-Sheet Validation
- ✅ Each sheet must have 2 header rows + data
- ✅ Sheets with < 3 rows are skipped
- ✅ All sheets processed independently
- ✅ Errors in one sheet don't affect others

## 🔍 Example Multi-School Upload

### Input: 3 Schools
```
School A: 25 students
School B: 30 students  
School C: 20 students
Total: 75 students
```

### Output JSON:
```json
{
  "result": [
    {
      "lga": "LGA A",
      "schoolName": "School A",
      "students": [/* 25 students */]
    },
    {
      "lga": "LGA B",
      "schoolName": "School B",
      "students": [/* 30 students */]
    },
    {
      "lga": "LGA C",
      "schoolName": "School C",
      "students": [/* 20 students */]
    }
  ]
}
```

## 📝 Notes

1. **Subject Keys**: Uses lowercase camelCase keys (mathematics, english, generalKnowledge, igbo).
2. **CA Format**: Stored internally as string, converted to number for API using `parseFloat()`.
3. **Exam Format**: Stored and sent as number.
4. **Dynamic Subjects**: API interface uses `[key: string]` to support flexible subject names.
5. **Grouping**: Students are automatically grouped by school name from CSV.
6. **LGA**: Taken from the first student in each school group.
7. **Redirect**: After successful upload, redirects to `/bece-portal/dashboard/schools`.

## 🚀 Testing

### Sample Curl Request
```bash
curl -X POST https://moe-backend-production-3842.up.railway.app/ubeat/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @payload.json
```

### Expected Response Time
- Small files (< 100 students): 1-3 seconds
- Medium files (100-500 students): 3-8 seconds
- Large files (500+ students): 8-15 seconds
