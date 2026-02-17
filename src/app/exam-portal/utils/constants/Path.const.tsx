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
        href: '/exam-portal/dashboard',
        active: pathname === '/exam-portal/dashboard' || (pathname !== '/exam-portal/dashboard/view-uploads' && !pathname.includes('/exam-portal/dashboard/schools') && !pathname.includes('/exam-portal/dashboard/uploads'))
    },
    {
        icon: <IoPeopleOutline />,
        iconActive: <IoPeople />,
        label: 'Schools',
        abbr: 'Schools Management',
        href: '/exam-portal/dashboard/schools',
        active: pathname.includes('/exam-portal/dashboard/schools')
    },
    {
        icon: <IoCloudUploadOutline />,
        iconActive: <IoCloudUpload />,
        label: 'Upload Results',
        abbr: 'Upload Results',
        href: '/exam-portal/dashboard/uploads',
        active: pathname.includes('/exam-portal/dashboard/uploads')
    },
    {
        icon: <IoCloudDoneOutline />,
        iconActive: <IoCloudDone />,
        label: 'View Uploads',
        abbr: 'View Uploads',
        href: '/exam-portal/dashboard/view-uploads',
        active: pathname === '/exam-portal/dashboard/view-uploads'
    }
]