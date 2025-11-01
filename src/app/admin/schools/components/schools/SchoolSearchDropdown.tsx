import { useRouter } from 'next/navigation';
import { School } from '@/services/schoolService';

interface SchoolSearchDropdownProps {
  schools: School[];
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSchoolSelect: (school: School) => void;
}

export default function SchoolSearchDropdown({
  schools,
  isOpen,
  isLoading,
  onClose,
  onSchoolSelect
}: SchoolSearchDropdownProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSchoolClick = (school: School) => {
    onSchoolSelect(school);
    onClose();
    // Navigate to school detail page
    router.push(`/admin/schools/${school._id}`);
  };

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading schools...</p>
        </div>
      ) : schools.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">No schools found</p>
        </div>
      ) : (
        <div className="py-2">
          {schools.map((school) => (
            <button
              key={school._id}
              onClick={() => handleSchoolClick(school)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex flex-col">
                <div className="font-medium text-gray-900 text-sm">
                  {school.schoolName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  
                
                </div>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    school.status === 'approved' ? 'bg-green-100 text-green-800' :
                    school.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    school.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    school.status === 'onboarded' ? 'bg-blue-100 text-blue-800' :
                    school.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {school.status === 'not_applied' ? 'Not Applied' : 
                     school.status === 'pending' ? 'Pending' :
                     school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
