import SearchComponent from './SearchComponent';
import UploadDropdown from './UploadDropdown';

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200">
            <div className="px-6 h-[4.45rem] flex items-center w-full">
                <div className="flex items-center justify-between w-full">
                    {/* Center Section - Search */}
                    <SearchComponent />

                    {/* Right Section - Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Upload Dropdown */}
                        <UploadDropdown />
                    </div>
                </div>
            </div>
        </header>
    )
}