import { UserProfile } from "@/app/portal/iirs/providers/AuthProvider";

export const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/iirs-admin`;

export async function getTransactionData(
    token: string,
    period: '1day' | '1week' | '1month' | '1year' | 'all' = 'all'
) {
    const params = new URLSearchParams();
    params.append('period', period);
    
    const response = await fetch(`${BASE_URL}/stats?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}

export interface Payment {
    id: string;
    schoolName: string;
    schoolCode: string;
    state: string;
    amount: number;
    numberOfStudents: number;
    paymentStatus: "successful" | string;
    paymentMethod: string;
    notes: string;
    description: string;
    pointsAwarded: number;
    paidAt: string;
    reference: string;
    iirsEarning: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface PaymentsData {
    payments: Payment[];
    pagination: Pagination;
}

export async function getPaymentsData(
    token: string, 
    page: number = 1, 
    limit?: number, 
    period: '1day' | '1week' | '1month' | '1year' | 'all' = 'all'
): Promise<PaymentsData> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    params.append('period', period);
    
    const response = await fetch(`${BASE_URL}/payments?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}

export async function login(email: string, password: string){
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
            return {success: true, message: 'Login Successful', access_token: data.access_token}
        }else{
            return {success: false, message: data.message, access_token: null}
        }
    }catch(error){
        console.error('Login failed:', error);
        throw error;
    }
}


export async function getProfile(token: string): Promise<UserProfile>{
    try {
        const response = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if(response.status === 401){
            throw new Error('Unauthorized');
        }
        return response.json();
    } catch (error) {
        console.error('Profile fetch failed:', error);
        throw error;
    }
}