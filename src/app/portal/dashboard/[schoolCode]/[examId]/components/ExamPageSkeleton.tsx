export default function ExamPageSkeleton() {
  return (
    <div className="flex-1 mt-4 sm:mt-6 animate-pulse">
      {/* Exam Application Form Skeleton */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section Skeleton */}
          <div className="bg-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-64"></div>
              </div>
            </div>
          </div>

          {/* School Info Section Skeleton */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="p-6">
            <div className="mb-6">
              {/* Info Banner Skeleton */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-12 bg-gray-100 border border-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>

              {/* Warning Box Skeleton */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mt-6">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>

              {/* Terms Checkbox Skeleton */}
              <div className="flex items-start gap-3 mt-6">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>

              {/* Submit Button Skeleton */}
              <div className="mt-6 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
