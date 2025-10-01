'use client'

import { useEffect } from "react"

export default function IIRS(){
    useEffect(()=>{
        const token = localStorage.getItem('token')
        if(!token){
            window.location.href = '/portal/iirs/login'
        }
        window.location.href = '/portal/iirs/dashboard'
    }, [])


    return(
        <div>
            <div></div>
        </div>
    )
}