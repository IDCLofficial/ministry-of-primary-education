import { Application } from "@/lib/admin-schools/api";
import { School } from "@/services/schoolService";

interface SchoolDataTableProps {
  data: (School | Application)[];
  currentTab: string;
  selectedApplications: string[];
  onSelectApplication: (id: string) => void;
  onSelectAllApplications: () => void;
  onViewFullDetails: (item: School | Application) => void;
}

export default function SchoolDataTable({
  data,
  currentTab,
  selectedApplications,
  onSelectApplication,
  onSelectAllApplications,
  onViewFullDetails,
}: SchoolDataTableProps) {
  // Type guard functions
  const isApplication = (item: School | Application): item is Application => {
    return 'applicationStatus' in item;
  };

  const isSchool = (item: School | Application): item is School => {
    return 'status' in item && !('applicationStatus' in item);
  };

  // Helper function to get status safely
  const getStatus = (item: School | Application): string => {
    if (isSchool(item)) {
      return item.status || 'not applied';
    } else {
      // For Application, check both applicationStatus and nested school.status
      return item.applicationStatus || item.school?.status || 'not applied';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {(currentTab === "applied" || currentTab === "onboarded") && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedApplications.length === data.length && data.length > 0}
                  onChange={onSelectAllApplications}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              School Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Principal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Students
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
           
            <tr key={item._id} className="hover:bg-gray-50">
              {(currentTab === "applied" || currentTab === "onboarded") && (
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedApplications.includes(item._id)}
                    onChange={() => onSelectApplication(item._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {isSchool(item) ? item.schoolName : 
                   isApplication(item) ? (item.school?.schoolName || item.schoolName) : 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {isSchool(item) ? item.principal : 
                   isApplication(item) ? (item.school?.principal || item.principal) : 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  getStatus(item) === 'approved' ? 'bg-green-100 text-green-800' :
                  getStatus(item) === 'rejected' ? 'bg-red-100 text-red-800' :
                  getStatus(item) === 'applied' ? 'bg-yellow-100 text-yellow-800' :
                  getStatus(item) === 'onboarded' ? 'bg-blue-100 text-blue-800' :
                  getStatus(item) === 'completed' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStatus(item)}
                </span>
                
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {isSchool(item) ? (item.students?.length || item.numberOfStudents || 0) : 
                 isApplication(item) ? (item.school?.students?.length || item.numberOfStudents || 0) : 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewFullDetails(item)}
                    className="text-green-600 hover:text-green-900"
                  >
                    View Full Details
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
