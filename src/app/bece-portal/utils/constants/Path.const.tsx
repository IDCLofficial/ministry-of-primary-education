import { IoCloudDone, IoCloudDoneOutline, IoCloudUpload, IoCloudUploadOutline, IoGrid, IoGridOutline, IoPeople, IoPeopleOutline } from "react-icons/io5"

interface MenuItem {
    icon: React.ReactNode,
    iconActive: React.ReactNode,
    label: string,
    href: string,
    active: boolean,
    abbr?: string
}

export const menuItems: (pathname: string) => MenuItem[] = (pathname: string) => [
    {
        icon: <IoGridOutline />,
        iconActive: <IoGrid />, 
        label: 'Dashboard',
        href: '/bece-portal/dashboard',
        active: pathname === '/bece-portal/dashboard' || (pathname !== '/bece-portal/dashboard/view-uploads' && !pathname.includes('/bece-portal/dashboard/schools') && !pathname.includes('/bece-portal/dashboard/uploads'))
    },
    {
        icon: <IoPeopleOutline />,
        iconActive: <IoPeople />,
        label: 'Schools',
        abbr: 'Schools Management',
        href: '/bece-portal/dashboard/schools',
        active: pathname.includes('/bece-portal/dashboard/schools')
    },
    {
        icon: <IoCloudUploadOutline />,
        iconActive: <IoCloudUpload />,
        label: 'Upload Results',
        abbr: 'Upload Results',
        href: '/bece-portal/dashboard/uploads',
        active: pathname.includes('/bece-portal/dashboard/uploads')
    },
    {
        icon: <IoCloudDoneOutline />,
        iconActive: <IoCloudDone />,
        label: 'View Uploads',
        abbr: 'View Uploads',
        href: '/bece-portal/dashboard/view-uploads',
        active: pathname === '/bece-portal/dashboard/view-uploads'
    }
]