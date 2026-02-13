# UBEAT Upload - XLSX Format Guide

## Overview
The UBEAT upload system supports both CSV and XLSX (Excel) files with multi-sheet processing capability.

## XLSX File Requirements

### Structure
- **Multiple Sheets Supported**: Each sheet in an XLSX file will be processed as a separate batch of students
- **Same Format Required**: All sheets must follow the same format as described below
- **Empty Sheets**: Empty sheets (with fewer than 3 rows) are automatically skipped

### File Format (Same for CSV and XLSX Sheets)

#### Row 1 - Main Headers:
```
S/NO., LGA, ZONE, SCHOOL NAME, CODE NO., CANDIDATE'S NAME, EXAM NO., SEX, AGE, ATTENDANCE, MATHEMATICS, , , ENGLISH LANGUAGE, , , GENERAL KNOWLEDGE, , , IGBO, ,
```

#### Row 2 - Sub-headers (Score Breakdown):
```
, , , , , , , , , , CAS-30%, CAS-70%, TOTAL, CAS-30%, CAS-70%, TOTAL, CAS-30%, CAS-70%, TOTAL, CAS-30%, CAS-70%, TOTAL
```

#### Row 3+ - Student Data:
```
1, IHITTE UBOMA, OKIGWE, CENTRAL SCHOOL AMAINYI, IB/014, AKINBOLA ELIZABETH OMOBA, IB/014/0391, F, 13, 1, 27, 37, 64, 28, 42, 76, 29, 54, 83, 26, 45, 71
```

## Column Mapping

| Column | Field Name | Description |
|--------|-----------|-------------|
| 1 | S/NO. | Serial Number |
| 2 | LGA | Local Government Area |
| 3 | ZONE | Educational Zone |
| 4 | SCHOOL NAME | Name of the School |
| 5 | CODE NO. | School Code |
| 6 | CANDIDATE'S NAME | Student Name |
| 7 | EXAM NO. | Examination Number |
| 8 | SEX | Gender (M/F) |
| 9 | AGE | Student Age |
| 10 | ATTENDANCE | Attendance Record (see variations below) |
| 11-13 | MATHEMATICS | CA-30%, CA-70%, Total |
| 14-16 | ENGLISH LANGUAGE | CA-30%, CA-70%, Total |
| 17-19 | GENERAL KNOWLEDGE | CA-30%, CA-70%, Total |
| 20-22 | IGBO | CA-30%, CA-70%, Total |

### Attendance Field Variations

The ATTENDANCE field (Column 10) supports two formats:

**Variation 1: Numeric Values**
```
1, IHITTE UBOMA, OKIGWE, CENTRAL SCHOOL AMAINYI, IB/014, AKINBOLA ELIZABETH OMOBA, IB/014/0391, F, 13, 1, 27, 37, 64, ...
```
- Used for tracking attendance count or status code
- Typically used for children/regular students
- Example values: 1, 2, 3, etc.

**Variation 2: Text Values**
```
1, EZINIHITTE MBAISE, OWERRI, ADULT, 054, ASUMUYA FAVOUR IJEOMA, EZ/054/1495, F, 29, PRESENT, 26, 39, 65, ...
```
- Used for descriptive attendance status
- Typically used for adult education programs
- Example values: PRESENT, ABSENT, etc.

**Both formats are automatically detected and handled correctly by the parser.**

## Score Structure

Each of the 4 subjects has 3 columns:
1. **CA-30%**: Continuous Assessment (max: 30 points)
2. **CA-70%**: Examination Score (max: 70 points)
3. **TOTAL**: Sum of CA-30% and CA-70% (max: 100 points)

### Subjects Covered:
1. Mathematics
2. English Language
3. General Knowledge
4. Igbo Language

## XLSX Processing Features

### Multi-Sheet Processing
- ✅ All sheets are automatically detected and processed
- ✅ Each sheet can contain students from different schools
- ✅ Sheet names are included in error messages for easy debugging
- ✅ Progress feedback shows which sheets were successfully parsed

### Error Handling
- ❌ Sheets with fewer than 3 rows are skipped with a warning
- ❌ Invalid data in a sheet doesn't stop processing of other sheets
- ❌ Detailed error messages show which sheet failed and why
- ✅ Successfully parsed records are still imported even if some sheets fail

### Console Output
When uploading XLSX files, check the browser console for detailed logs:
```
✓ Successfully parsed 25 records from sheet "School A"
✗ Error parsing sheet "School B": Not enough rows
✓ Successfully parsed 30 records from sheet "School C"
✓ Total records parsed from "results.xlsx": 55 students from 3 sheet(s)
```

## Example XLSX Structure

### File: `UBEAT_RESULTS_2025.xlsx`

#### Sheet 1: "Central School Amainyi"
- Row 1: Headers
- Row 2: Sub-headers
- Row 3-27: 25 students from Central School Amainyi

#### Sheet 2: "Model Primary School"
- Row 1: Headers
- Row 2: Sub-headers  
- Row 3-42: 40 students from Model Primary School

#### Sheet 3: "Community School"
- Row 1: Headers
- Row 2: Sub-headers
- Row 3-17: 15 students from Community School

**Result**: All 80 students (25 + 40 + 15) will be imported from a single XLSX file.

## Validation Rules

1. **Required Fields**: Student Name, Exam Number must not be empty
2. **Score Limits**: 
   - CA-30% must be between 0 and 30
   - CA-70% must be between 0 and 70
   - Total is automatically calculated
3. **Duplicate Detection**: Students with duplicate Exam Numbers are skipped
4. **Gender Values**: Accepts M/F or Male/Female (case-insensitive)

## Tips for Best Results

1. **Use Templates**: Create one sheet with proper format, then duplicate for other schools
2. **Consistent Headers**: Ensure all sheets have identical header rows
3. **Check Sheet Names**: Use descriptive sheet names for easier debugging
4. **Test Small First**: Test with a small file before uploading large datasets
5. **Monitor Console**: Keep browser console open to see detailed processing logs

## Common Issues

### Issue: "No valid data found in any sheet"
**Solution**: Check that at least one sheet has 3+ rows (2 headers + 1 data row)

### Issue: "Not enough rows"
**Solution**: Ensure sheets have both header rows and at least one data row

### Issue: Sheet skipped silently
**Solution**: Check browser console - empty or invalid sheets show warnings

### Issue: Some students missing
**Solution**: Check for duplicate exam numbers - duplicates are automatically skipped
