import { IoFileTrayFull, IoFileTrayFullOutline, IoFolderOpen, IoFolderOpenOutline, IoGrid, IoGridOutline} from "react-icons/io5"
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
        icon: <IoFileTrayFullOutline />,
        iconActive: <IoFileTrayFull />,
        label: 'Upload CA',
        abbr: 'Continuos Assessment',
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
]