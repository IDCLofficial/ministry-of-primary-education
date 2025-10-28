# Redux Toolkit Setup for Portal

## Installation Required

Run the following command to install Redux Toolkit and RTK Query:

```bash
npm install @reduxjs/toolkit react-redux
```

## File Structure Created

```
src/app/portal/
├── store/
│   ├── index.ts                 # Main store configuration
│   ├── hooks.ts                 # Typed hooks and custom hooks
│   ├── api/
│   │   ├── apiSlice.ts         # Base API slice with RTK Query
│   │   ├── studentsApi.ts      # Students API endpoints
│   │   └── paymentsApi.ts      # Payments API endpoints
│   └── slices/
│       ├── studentsSlice.ts    # Student selection and pagination state
│       ├── filtersSlice.ts     # Filter state management
│       └── uiSlice.ts          # UI state (modals, loading, etc.)
├── providers/
│   └── ReduxProvider.tsx       # Redux Provider wrapper
└── layout.tsx                  # Updated with Redux Provider

```

## Features Implemented

### 1. Store Configuration (`store/index.ts`)
- ✅ Configured with Redux Toolkit
- ✅ RTK Query middleware setup
- ✅ DevTools enabled for development
- ✅ Proper TypeScript types (RootState, AppDispatch)

### 2. API Layer (`store/api/`)
- ✅ Base API slice with authentication headers
- ✅ Students API endpoints (CRUD operations)
- ✅ Payments API endpoints (payment processing)
- ✅ Proper TypeScript interfaces
- ✅ Cache invalidation tags

### 3. State Slices (`store/slices/`)

#### Students Slice
- ✅ Student selection management
- ✅ Search term state
- ✅ Sorting state
- ✅ Pagination state

#### Filters Slice
- ✅ Current vs Applied filters separation
- ✅ Pending changes tracking
- ✅ Filter reset functionality

#### UI Slice
- ✅ Modal states (payment, filters)
- ✅ Loading states
- ✅ Toast notifications
- ✅ Theme preferences

### 4. Custom Hooks (`store/hooks.ts`)
- ✅ Typed useAppDispatch and useAppSelector
- ✅ useStudentSelection hook
- ✅ useFilters hook
- ✅ useUI hook

### 5. Provider Setup
- ✅ ReduxProvider component
- ✅ Integrated into portal layout

## Usage Examples

### Using Student Selection
```tsx
import { useStudentSelection } from '../store/hooks'

function StudentComponent() {
  const { selectedStudents, selectStudent, clearAll } = useStudentSelection()
  
  return (
    <div>
      <p>Selected: {selectedStudents.length}</p>
      <button onClick={() => selectStudent('123')}>Select Student</button>
      <button onClick={clearAll}>Clear All</button>
    </div>
  )
}
```

### Using Filters
```tsx
import { useFilters } from '../store/hooks'

function FilterComponent() {
  const { currentFilters, hasPendingChanges, updateFilter, applyFilters } = useFilters()
  
  return (
    <div>
      <select onChange={(e) => updateFilter('class', e.target.value)}>
        <option value="All">All Classes</option>
        <option value="SS1">SS1</option>
      </select>
      {hasPendingChanges && (
        <button onClick={applyFilters}>Apply Filters</button>
      )}
    </div>
  )
}
```

### Using RTK Query
```tsx
import { useGetStudentsQuery } from '../store/api/studentsApi'

function StudentsList() {
  const { data, isLoading, error } = useGetStudentsQuery({
    page: 1,
    limit: 10,
    search: 'john'
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading students</div>
  
  return (
    <div>
      {data?.data.map(student => (
        <div key={student.id}>{student.fullName}</div>
      ))}
    </div>
  )
}
```

## Next Steps

1. **Install Dependencies**: Run `npm install @reduxjs/toolkit react-redux`
2. **Update Components**: Migrate existing components to use Redux state
3. **API Integration**: Connect RTK Query endpoints to your backend
4. **Error Handling**: Add proper error boundaries and error states
5. **Persistence**: Add redux-persist if needed for state persistence

## Benefits

- ✅ **Type Safety**: Full TypeScript support
- ✅ **Performance**: RTK Query caching and optimization
- ✅ **Developer Experience**: Redux DevTools integration
- ✅ **Scalability**: Modular slice-based architecture
- ✅ **Code Splitting**: API endpoints can be code-split
- ✅ **Real-time Updates**: Easy to add WebSocket integration
