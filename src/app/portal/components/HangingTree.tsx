"use client"

import Lottie from 'lottie-react'
import React from 'react'
import animationData01 from "./lottie/open-doodles-reading-side.json"
import animationData02 from "./lottie/open-doodles-sitting-man.json"

export default function HangingTree() {
    return (
        <div className='fixed inset-0 h-screen w-screen flex sm:justify-between justify-center items-end'>
            <Lottie
                animationData={animationData01}
                loop={true}
                autoPlay={true}
                style={{
                    height: '40vmin'
                }}
                />
            <Lottie
                animationData={animationData02}
                loop={true}
                autoPlay={true}
                
                className='max-sm:hidden'
                style={{
                    height: '40vmin'
                }}
            />
        </div>
    )
}
