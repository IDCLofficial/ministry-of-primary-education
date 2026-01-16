import { IoCloudDone, IoCloudDoneOutline, IoFileTrayFull, IoFileTrayFullOutline, IoFolderOpen, IoFolderOpenOutline, IoGrid, IoGridOutline, IoPeople, IoPeopleOutline} from "react-icons/io5"

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
        label: 'Schools',
        abbr: 'Schools Management',
        href: '/bece-portal/dashboard/schools',
        active: pathname === '/bece-portal/dashboard/schools'
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