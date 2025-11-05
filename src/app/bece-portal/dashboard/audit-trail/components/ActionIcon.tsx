'use client'
import {
    IoDocumentTextOutline,
    IoPersonAddOutline,
    IoEyeOutline,
    IoDownloadOutline,
    IoCloudUploadOutline,
    IoTrashOutline,
    IoSettingsOutline,
    IoPersonOutline
} from 'react-icons/io5'

interface ActionIconProps {
    action: 'upload' | 'download' | 'delete' | 'view' | 'create' | 'update' | 'login' | 'logout'
}

export function ActionIcon({ action }: ActionIconProps) {
    const iconClass = "w-5 h-5"
    switch (action) {
        case 'upload':
            return <IoCloudUploadOutline className={`${iconClass} text-blue-600`} />
        case 'download':
            return <IoDownloadOutline className={`${iconClass} text-green-600`} />
        case 'delete':
            return <IoTrashOutline className={`${iconClass} text-red-600`} />
        case 'view':
            return <IoEyeOutline className={`${iconClass} text-gray-600`} />
        case 'create':
            return <IoPersonAddOutline className={`${iconClass} text-purple-600`} />
        case 'update':
            return <IoSettingsOutline className={`${iconClass} text-orange-600`} />
        case 'login':
        case 'logout':
            return <IoPersonOutline className={`${iconClass} text-indigo-600`} />
        default:
            return <IoDocumentTextOutline className={`${iconClass} text-gray-600`} />
    }
}
