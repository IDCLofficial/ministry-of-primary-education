import SearchComponent from './SearchComponent';
import UploadDropdown from './UploadDropdown';

export default function Header() {
    

    const handleUploadSelect = (value: string) => {
        console.log('Upload option selected:', value)
        // TODO: Handle upload actions
        switch (value) {
            case 'upload-ca':
                // Handle CA upload
                console.log('Handling CA upload...')
                break
            case 'upload-exams':
                // Handle Exams upload
                console.log('Handling Exams upload...')
                break
            default:
                break
        }
    }

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="px-6 h-[4.45rem] flex items-center w-full">
                <div className="flex items-center justify-between w-full">
                    {/* Center Section - Search */}
                    <SearchComponent />

                    {/* Right Section - Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Upload Dropdown */}
                        <UploadDropdown onSelect={handleUploadSelect} />
                    </div>
                </div>
            </div>
        </header>
    )
}