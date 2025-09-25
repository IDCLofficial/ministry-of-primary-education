import Image from 'next/image'
import React from 'react'

export default function Header() {
    return (
        <header className='sm:p-4 sticky sm:top-4 top-2 z-50 p-2 bg-white/50 backdrop-blur-lg flex justify-between items-center rounded-xl shadow-lg shadow-black/5 border border-black/10'>
            <div className='flex gap-2 items-center'>
                <Image
                    src="/images/ministry-logo.png"
                    alt="logo"
                    width={30}
                    height={30}
                    className='object-contain'
                />
                <span className='sm:text-base text-sm font-extrabold'>IMMoE</span>
            </div>
            <div className='sm:flex hidden gap-2 items-center'>
                <span className='sm:text-sm text-xs font-semibold'>Government Secondary School</span>
                <svg
                    height="25px"
                    width="25px"
                    version="1.1"
                    id="_x32_"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 512 512"
                    xmlSpace="preserve"
                    fill="#000000"
                >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <g>
                            <path className="st0" d="M320.707,0L37.037,69.971v417.625L320.447,512l154.516-26.258V62.568L320.707,0z M290.346,471.742 l-92.584-7.974v-79.426l-55.086-0.677v75.36l-68.109-5.866V99.367l215.779-53.224V471.742z"></path>
                            <polygon className="st0" points="271.25,76.933 226.537,86.32 226.537,138.956 271.25,131.246 "></polygon>
                            <polygon className="st0" points="118.574,112.033 87.416,118.622 87.416,164.818 118.574,159.469 "></polygon>
                            <polygon className="st0" points="190.012,95.942 150.426,104.23 150.426,153.027 190.012,146.202 "></polygon>
                            <polygon className="st0" points="118.576,203.184 87.416,207.448 87.416,253.722 118.576,250.622 "></polygon>
                            <polygon className="st0" points="190.012,192.792 150.426,198.154 150.426,246.952 190.012,243.052 "></polygon>
                            <polygon className="st0" points="271.25,181.04 226.537,187.097 226.537,238.911 271.25,234.506 "></polygon>
                            <polygon className="st0" points="271.25,286.135 226.537,288.889 226.537,340.702 271.25,339.6 "></polygon>
                            <polygon className="st0" points="190.012,291.476 150.426,293.914 150.426,342.712 190.012,341.737 "></polygon>
                            <polygon className="st0" points="118.574,296.198 87.416,298.136 87.416,344.409 118.574,343.634 "></polygon>
                        </g>
                    </g>
                </svg>
            </div>
        </header>
    )
}
