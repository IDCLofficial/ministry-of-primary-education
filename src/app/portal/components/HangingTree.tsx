"use client"

import Lottie from 'lottie-react'
import React from 'react'
import animationData01 from "./lottie/open-doodles-reading-side.json"
import animationData02 from "./lottie/open-doodles-sitting-man.json"

export default function HangingTree({ type = "both" }: { type?: "left" | "right" | "both" }) {
    return (
        <div className={
            'fixed inset-0 h-screen w-screen flex ' 
            + (type === "both" ? "sm:justify-between justify-center items-end" : "")
            + (type === "right" ? "sm:justify-end justify-center items-end" : "")
            + (type === "left" ? "sm:justify-start justify-center items-end" : "")
        }>
            {(type === "left" || type === "both") && (
                <Lottie
                    animationData={animationData01}
                    loop={true}
                    autoPlay={true}
                    style={{
                        height: '40vmin'
                    }}
                />
            )}
            {(type === "right" || type === "both") && (
                <Lottie
                    animationData={animationData02}
                    loop={true}
                    autoPlay={true}
                    className='max-sm:hidden mb-5'
                    style={{
                        height: '40vmin',
                    }}
                />
            )}
        </div>
    )
}
