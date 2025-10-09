import { IoCloudDone, IoCloudDoneOutline, IoFileTrayFull, IoFileTrayFullOutline, IoFolderOpen, IoFolderOpenOutline, IoGrid, IoGridOutline, IoLockOpen, IoLockOpenOutline, IoPeople, IoPeopleOutline} from "react-icons/io5"

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
        active: pathname === '/bece-portal/dashboard'
    },
    {
        icon: <IoPeopleOutline />,
        iconActive: <IoPeople />,
        label: 'Students',
        abbr: 'Student Management',
        href: '/bece-portal/dashboard/students',
        active: pathname === '/bece-portal/dashboard/students'
    },
    {
        icon: <IoFileTrayFullOutline />,
        iconActive: <IoFileTrayFull />,
        label: 'Upload CA',
        abbr: 'Continuous Assessment',
        href: '/bece-portal/dashboard/upload-ca',
        active: pathname === '/bece-portal/dashboard/upload-ca'
    },
    {
        icon: <IoFolderOpenOutline />,
        iconActive: <IoFolderOpen />,
        label: 'Upload Exams',
        abbr: 'Examinations',
        href: '/bece-portal/dashboard/upload-exams',
        active: pathname === '/bece-portal/dashboard/upload-exams'
    },
    {
        icon: <IoCloudDoneOutline />,
        iconActive: <IoCloudDone />,
        label: 'View Uploads',
        abbr: 'View Uploads',
        href: '/bece-portal/dashboard/view-uploads',
        active: pathname === '/bece-portal/dashboard/view-uploads'
    },
    {
        icon: <IoLockOpenOutline />,
        iconActive: <IoLockOpen />,
        label: 'Audit Trail',
        abbr: 'System Audit',
        href: '/bece-portal/dashboard/audit-trail',
        active: pathname === '/bece-portal/dashboard/audit-trail'
    }
]