import { IoGrid} from "react-icons/io5"
interface MenuItem {
    icon: React.ReactNode
    label: string
    href: string
    active: boolean
}

export const menuItems: (pathname: string) => MenuItem[] = (pathname: string) => [
    {
        icon: <IoGrid />,
        label: 'Dashboard',
        href: '/bece-portal/dashboard',
        active: pathname === '/bece-portal/dashboard'
    },
]