# UBEAT Alternative Form - Dropdown Implementation

## Overview
The UBEAT alternative login form now uses intelligent dropdowns for LGA and School Name selection, matching the implementation from the RegistrationForm component.

## Features Implemented

### 1. **LGA Dropdown**
- **Type**: Standard dropdown
- **Options**: All 27 Imo State LGAs
- **Behavior**: 
  - When a new LGA is selected, the school name field is automatically cleared
  - This ensures users select a school from the correct LGA

**LGAs Available:**
- Aboh Mbaise
- Ahiazu Mbaise
- Ehime Mbano
- Ezinihitte
- Ideato North
- Ideato South
- Ihitte/Uboma
- Ikeduru
- Isiala Mbano
- Isu
- Mbaitoli
- Ngor Okpala
- Njaba
- Nkwerre
- Nwangele
- Obowo
- Oguta
- Ohaji/Egbema
- Okigwe
- Onuimo
- Orlu
- Orsu
- Oru East
- Oru West
- Owerri Municipal
- Owerri North
- Owerri West

### 2. **School Name Dropdown**
- **Type**: Searchable dropdown
- **Dynamic Loading**: Schools are fetched from API based on selected LGA
- **Search**: Real-time search filtering for quick school selection
- **Loading States**:
  - Shows spinner while fetching schools
  - Shows "Please select an LGA first" if no LGA selected
  - Shows "No schools available" if API returns empty list

**Features:**
- **Auto-fetch**: When LGA is selected, automatically queries `useGetSchoolNamesQuery` hook
- **Searchable**: Type to filter through hundreds of schools
- **Clean Labels**: Removes leading quotes from school names if present
- **Disabled States**: Cannot select school until LGA is chosen

### 3. **Form Validation**
Enhanced validation now includes:
```typescript
const isAltFormValid = 
  altFormData.fullName.trim().length >= 3 &&      // Name at least 3 chars
  altFormData.schoolName.trim().length >= 3 &&    // School selected
  altFormData.lga.trim().length >= 2 &&           // LGA selected
  altFormData.examYear.trim().length === 4 &&     // Valid year (4 digits)
  !isLoadingSchoolNames &&                        // Not currently loading
  !isFetching                                     // No fetch in progress
```

## Technical Implementation

### Dependencies Added
```typescript
import CustomDropdown from '@/app/portal/dashboard/components/CustomDropdown'
import { useGetSchoolNamesQuery } from '@/app/portal/store/api/authApi'
```

### State Management
```typescript
// Fetch schools based on LGA
const { data: schoolNames, isLoading: isLoadingSchoolNames, isFetching } = 
  useGetSchoolNamesQuery(
    { lga: altFormData.lga },
    { skip: !altFormData.lga }
  )

// Memoized school list
const schoolNamesList = useMemo(() => {
  if (!schoolNames) return []
  return schoolNames
}, [schoolNames])

// LGA options
const lgaOptions = useMemo(() => {
  return IMO_STATE_LGAS.map(lga => ({ value: lga, label: lga }))
}, [])
```

### Field Order
Optimized for better UX:
1. **Full Name** (text input)
2. **LGA** (dropdown) - Select first
3. **School Name** (searchable dropdown) - Loads based on LGA
4. **Exam Year** (text input)

## User Experience Flow

### Happy Path
```
1. User clicks "Don't know your exam number?"
2. Form switches to alternative mode
3. User enters their full name
4. User selects LGA from dropdown (e.g., "Owerri Municipal")
5. School field shows loading spinner
6. Schools populate in searchable dropdown
7. User searches and selects their school
8. User enters exam year
9. Form becomes valid, payment button enabled
10. User proceeds to payment
```

### Edge Cases Handled

#### Case 1: No LGA Selected
```
School Name field displays:
"Please select an LGA first"
(Grayed out, cannot interact)
```

#### Case 2: Loading Schools
```
School Name field displays:
[Spinner] "Loading Owerri Municipal schools..."
(Shows which LGA is being queried)
```

#### Case 3: No Schools Found
```
School Name field displays:
"No schools available for the selected LGA"
(Rare, but handled gracefully)
```

#### Case 4: LGA Changed
```
When user selects a different LGA:
- Previous school selection is cleared
- New schools are loaded for the new LGA
- User must reselect a school
```

## API Integration

### Endpoint Used
```
GET /api/schools/names?lga={lgaName}
```

### Response Format
```typescript
Array<{
  schoolName: string
  lga: string
  hasAccount: boolean
  // ... other fields
}>
```

### Query Configuration
- **Skip**: Query is skipped if no LGA is selected
- **Caching**: RTK Query handles caching of school lists per LGA
- **Refetching**: Automatically refetches when LGA changes

## Comparison with RegistrationForm

| Feature | RegistrationForm | UBEAT Alternative Form | Notes |
|---------|------------------|------------------------|-------|
| LGA Selection | ✅ Dropdown | ✅ Dropdown | Identical implementation |
| School Selection | ✅ Searchable Dropdown | ✅ Searchable Dropdown | Same component, same behavior |
| Loading States | ✅ Yes | ✅ Yes | Matching UI/UX |
| Dynamic Fetching | ✅ Yes | ✅ Yes | Uses same API hook |
| Validation | ✅ Full | ✅ Full | Plus payment state checks |
| Field Order | LGA → School | Name → LGA → School | Minor difference for UX |

## Benefits

### For Students
- ✅ No typing errors in school names
- ✅ Easy to find school with search
- ✅ Clear feedback on what to do next
- ✅ Can't accidentally select wrong LGA/school combo

### For Data Quality
- ✅ Standardized LGA names
- ✅ Standardized school names
- ✅ Validated against existing database
- ✅ Easier backend matching

### For Support
- ✅ Fewer "can't find my school" issues
- ✅ Fewer typos to debug
- ✅ Better error messages
- ✅ Audit trail of selections

## Testing

### Manual Test Checklist
- [ ] LGA dropdown shows all 27 LGAs
- [ ] Selecting LGA triggers school fetch
- [ ] Loading spinner appears while fetching
- [ ] Schools populate in dropdown
- [ ] Search works in school dropdown
- [ ] Selecting school populates value
- [ ] Changing LGA clears school selection
- [ ] Form validation prevents submission without selections
- [ ] Payment button enables only when all valid

### Edge Cases to Test
- [ ] Select LGA with no schools (should show message)
- [ ] Select LGA, then change it (should clear school)
- [ ] Type invalid text in year field
- [ ] Try to proceed without selecting school
- [ ] Network error while loading schools

## Future Enhancements

### Possible Improvements
1. **Autocomplete for Name**: Match against existing student names
2. **Year Dropdown**: Limit to valid exam years (e.g., 2020-2026)
3. **School Favorites**: Remember recently selected schools
4. **Offline Support**: Cache school lists for offline access
5. **Pre-fill Data**: If email provided, pre-fill known data

### Performance Optimizations
1. **Debounced Search**: Already implemented via CustomDropdown
2. **Virtual Scrolling**: For LGAs with 100+ schools
3. **Pagination**: Load schools in batches if list is huge
4. **Service Worker**: Cache school data in background

## Troubleshooting

### Issue: Schools not loading
**Cause**: LGA not selected or API error
**Solution**: 
1. Ensure LGA is selected
2. Check network tab for API errors
3. Verify API_BASE_URL is set

### Issue: School names look weird (have quotes)
**Cause**: Data inconsistency in backend
**Solution**: Label cleaning logic already handles this
```typescript
label: String(school.schoolName).startsWith('"') 
  ? String(school.schoolName).slice(1) 
  : school.schoolName
```

### Issue: Form won't submit
**Cause**: Validation failing
**Solution**: Check all fields:
- Name: At least 3 characters
- LGA: Must be selected
- School: Must be selected (not just typed)
- Year: Exactly 4 digits
- Not currently loading

## Changelog

### Version 1.1.0 (2026-02-13)
- ✅ Replaced LGA text input with dropdown
- ✅ Replaced School text input with searchable dropdown
- ✅ Added dynamic school loading based on LGA
- ✅ Added loading states and user feedback
- ✅ Improved form validation
- ✅ Enhanced UX with clear error messages

---

**Implementation Complete** ✅

The UBEAT alternative form now provides a professional, user-friendly experience that matches the quality of the main registration system.
