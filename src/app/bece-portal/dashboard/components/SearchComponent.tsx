"use client"
import useShortcuts from '@useverse/useshortcuts';
import React from 'react';
import { useRouter } from 'next/navigation';
import { IoSchoolOutline, IoPeopleOutline, IoDocumentTextOutline, IoTimeOutline, IoTrendingUpOutline, IoStatsChartOutline, IoCloseCircle } from 'react-icons/io5';

type SearchCategory = 'pages' | 'actions' | 'schools' | 'students';

interface SearchItem {
    id: string;
    title: string;
    description?: string;
    category: SearchCategory;
    icon: React.ReactNode;
    action: () => void;
}

interface StoredSearchItem {
    id: string;
    title: string;
    description?: string;
    category: SearchCategory;
}

export default function SearchComponent() {
    const router = useRouter();
    const searchRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [recentSearches, setRecentSearches] = React.useState<SearchItem[]>([]);

    const isMac = navigator.userAgent.includes('Macintosh');

    // All available search items
    const allItems: SearchItem[] = React.useMemo(() => [
        // Pages
        {
            id: 'dashboard',
            title: 'Dashboard',
            description: 'View overview and statistics',
            category: 'pages',
            icon: <IoStatsChartOutline className="w-5 h-5" />,
            action: () => router.push('/bece-portal/dashboard')
        },
        {
            id: 'students',
            title: 'Student Management',
            description: 'Manage student records',
            category: 'pages',
            icon: <IoPeopleOutline className="w-5 h-5" />,
            action: () => router.push('/bece-portal/dashboard/students')
        },
        {
            id: 'view-uploads',
            title: 'View Uploads',
            description: 'View upload history',
            category: 'pages',
            icon: <IoDocumentTextOutline className="w-5 h-5" />,
            action: () => router.push('/bece-portal/dashboard/view-uploads')
        },
        // {
        //     id: 'audit-trail',
        //     title: 'Audit Trail',
        //     description: 'View system audit trail',
        //     category: 'pages',
        //     icon: <IoSettingsOutline className="w-5 h-5" />,
        //     action: () => router.push('/bece-portal/dashboard/audit-trail')
        // },
        {
            id: 'certificates',
            title: 'Certificates',
            description: 'Manage certificates',
            category: 'pages',
            icon: <IoDocumentTextOutline className="w-5 h-5" />,
            action: () => router.push('/bece-portal/dashboard/certificates')
        },
        // Actions
        {
            id: 'upload-ca',
            title: 'Upload CA',
            description: 'Upload Continuous Assessment results',
            category: 'actions',
            icon: <IoTrendingUpOutline className="w-5 h-5" />,
            action: () => router.push('/bece-portal/dashboard/upload-ca')
        },
        {
            id: 'upload-exams',
            title: 'Upload Exams',
            description: 'Upload examination results',
            category: 'actions',
            icon: <IoSchoolOutline className="w-5 h-5" />,
            action: () => router.push('/bece-portal/dashboard/upload-exams')
        },
    ], [router]);

    // Filter items based on search query
    const filteredItems = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        
        const query = searchQuery.toLowerCase();
        return allItems.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
    }, [searchQuery, allItems]);

    // Group filtered items by category
    const groupedItems = React.useMemo(() => {
        const groups: Record<SearchCategory, SearchItem[]> = {
            pages: [],
            actions: [],
            schools: [],
            students: []
        };

        filteredItems.forEach(item => {
            groups[item.category].push(item);
        });

        return groups;
    }, [filteredItems]);

    // Load recent searches from localStorage
    React.useEffect(() => {
        const stored = localStorage.getItem('recentSearches');
        if (stored) {
            try {
                const parsed: StoredSearchItem[] = JSON.parse(stored);
                // Reconstruct full items from stored data
                const reconstructed = parsed
                    .map(storedItem => allItems.find(item => item.id === storedItem.id))
                    .filter((item): item is SearchItem => item !== undefined)
                    .slice(0, 5);
                setRecentSearches(reconstructed);
            } catch (e) {
                console.error('Failed to parse recent searches', e);
            }
        }
    }, [allItems]);

    // Save to recent searches
    const addToRecent = (item: SearchItem) => {
        const updated = [
            item,
            ...recentSearches.filter(r => r.id !== item.id)
        ].slice(0, 5);
        
        setRecentSearches(updated);
        
        // Store only serializable data
        const toStore: StoredSearchItem[] = updated.map(({ id, title, description, category }) => ({
            id,
            title,
            description,
            category
        }));
        localStorage.setItem('recentSearches', JSON.stringify(toStore));
    };

    // Handle item selection
    const handleSelect = (item: SearchItem) => {
        addToRecent(item);
        item.action();
        setSearchQuery('');
        setIsOpen(false);
        searchRef.current?.blur();
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        const totalItems = filteredItems.length;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % totalItems);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    handleSelect(filteredItems[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSearchQuery('');
                searchRef.current?.blur();
                break;
        }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useShortcuts({
        shortcuts: [
            { key: '/', ctrlKey: true },
            (isMac ? { key: 'F', metaKey: true } : { key: 'F', ctrlKey: true })
        ],
        onTrigger: () => {
            searchRef.current?.focus();
            setIsOpen(true);
        }
    });

    const categoryLabels: Record<SearchCategory, string> = {
        pages: 'Pages',
        actions: 'Actions',
        schools: 'Schools',
        students: 'Students'
    };

    if (true) return <div></div>;
    
    return (
        <div className="flex-1 max-w-md relative" ref={dropdownRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search pages and actions..."
                    value={searchQuery}
                    ref={searchRef}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(0);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="block w-full peer pl-10 pr-12 py-2 border border-black/5 rounded-lg leading-5 bg-[#f3f3f3] placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                />
                {searchQuery && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            searchRef.current?.focus();
                        }}
                        className="absolute inset-y-0 right-0 pr-10 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <IoCloseCircle className="w-5 h-5" />
                    </button>
                )}
                <div className="absolute peer-focus:opacity-0 inset-y-0 right-0 pr-1.5 flex items-center pointer-events-none">
                    <kbd className="flex items-center gap-[0.05rem] justify-center h-7 w-8 border border-black/20 rounded text-xs font-mono bg-white shadow-lg text-gray-500 font-semibold">
                        <span className='text-lg'>{isMac ? '⌘' : 'Ctrl'}</span>F
                    </kbd>
                </div>
            </div>

            {/* Dropdown Modal */}
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[500px] overflow-hidden z-50 animate-fadeIn-y">
                    <div className="overflow-y-auto max-h-[500px]">
                        {/* Show filtered results when searching */}
                        {searchQuery.trim() && filteredItems.length > 0 ? (
                            <div className="py-2">
                                {Object.entries(groupedItems).map(([category, items]) => {
                                    if (items.length === 0) return null;
                                    
                                    return (
                                        <div key={category} className="mb-2">
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {categoryLabels[category as SearchCategory]}
                                            </div>
                                            {items.map((item) => {
                                                const globalIndex = filteredItems.indexOf(item);
                                                const isSelected = globalIndex === selectedIndex;
                                                
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleSelect(item)}
                                                        className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-all duration-150 group ${
                                                            isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                                                        }`}
                                                    >
                                                        <div className={`text-gray-400 group-hover:text-blue-500 transition-colors ${
                                                            isSelected ? 'text-blue-500' : ''
                                                        }`}>
                                                            {item.icon}
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {item.title}
                                                            </div>
                                                            {item.description && (
                                                                <div className="text-xs text-gray-500">
                                                                    {item.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {isSelected && (
                                                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 rounded border border-gray-300 text-gray-600">
                                                                ↵
                                                            </kbd>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : searchQuery.trim() && filteredItems.length === 0 ? (
                            // No results
                            <div className="py-12 text-center">
                                <div className="text-gray-400 mb-2">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500">No results found for &ldquo;{searchQuery}&rdquo;</p>
                                <p className="text-xs text-gray-400 mt-1">Try searching for pages or actions</p>
                            </div>
                        ) : (
                            // Show recent searches and suggestions when not searching
                            <div className="py-2">
                                {recentSearches.length > 0 && (
                                    <div className="mb-4">
                                        <div className="px-3 py-2 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                                <IoTimeOutline className="w-4 h-4" />
                                                Recent
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setRecentSearches([]);
                                                    localStorage.removeItem('recentSearches');
                                                }}
                                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        {recentSearches.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelect(item)}
                                                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-all duration-150 group"
                                            >
                                                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.title}
                                                    </div>
                                                    {item.description && (
                                                        <div className="text-xs text-gray-500">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Quick suggestions */}
                                <div>
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Suggestions
                                    </div>
                                    {allItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-all duration-150 group"
                                        >
                                            <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.title}
                                                </div>
                                                {item.description && (
                                                    <div className="text-xs text-gray-500">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer with keyboard shortcuts */}
                    <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono">↑↓</kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono">↵</kbd>
                                Select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono">Esc</kbd>
                                Close
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
