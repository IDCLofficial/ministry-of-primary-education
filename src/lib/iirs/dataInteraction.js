import { redirect } from "next/navigation";

export const BASE_URL = "https://moe-backend-nwp2.onrender.com/iirs-admin";

export async function getTransactionData() {
    const response = await fetch(`${BASE_URL}/stats`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.json();
}

export async function getPaymentsData() {
    const response = await fetch(`${BASE_URL}/payments`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.json();
}

export async function login(email, password){
    try{
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if(data.access_token){
            localStorage.setItem("token", data.access_token);
            return {success: true, message: 'Login Successful'}
        }else{
            return {success: false, message: data.message}
        }
    }catch(error){
        return;
    }
}


export async function getProfile(){
    const response = await fetch(`${BASE_URL}/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.json();
}