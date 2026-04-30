import { UserProfile } from "@/app/portal/iirs/providers/AuthProvider";
import { StringDecoder } from "string_decoder";

export const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/iirs-admin`;


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
    idclEarning: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface statsData {
    totalPayments: number;
    totalAmountProcessedByTsa: number;
    totalTsaEarnings: number;
    totalIdclEarnings: number;
    totalPaystackCharge: number;
    recentPayments: any[];
    totalLatestPayout: number;
    totalLatestIdclPayout: number;
    totalLatestTsaPayout: number;
}

export async function getTransactionData(
  token: string,
  period: 'today' | '1week' | '1month' | '1year' | 'all' = 'all',
  date?: string,
  mode: 'dashboard' | 'report' = 'dashboard'
): Promise<statsData> {

  const params = new URLSearchParams();

  params.append('period', period);

  if (date) {
    params.append('date', date);
    console.log(date)
  }

  params.append('mode', mode);

  const response = await fetch(
    `${BASE_URL}/stats?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

export interface PaymentsData {
    payments: Payment[];
    pagination: Pagination;
}

export interface ResultPaymentStatsQuery {
    examType?: string;
    year?: string;
    paymentStatus?: string;
    page?: string;
    limit?: string;
}

export interface ResultPaymentRecord {
    _id: string;
    examType: string;
    amount: number;
    examNumber: string;
    examYear: number;
    studentName: string;
    lga: string;
    schoolName: string;
    school: string;
    paymentReference: string;
    paymentStatus: string;
    searchMode: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    authorizationUrl?: string;
    email?: string;
    paidAt?: string;
}

export interface ResultPaymentExamTypeStats {
    totalAmount: number;
    count: number;
}

export interface ResultPaymentStatsResponse {
    data: ResultPaymentRecord[];
    total: number;
    totalAmount: number;
    amountByExamType: Record<string, ResultPaymentExamTypeStats>;
    page: number;
    limit: number;
    totalPages: number;
}

export async function getPaymentsData(
    token: string,
    page: number = 1,
    limit?: number,
    date?: string,
    period: '1day' | '1week' | '1month' | '1year' | 'all' = 'all'
): Promise<PaymentsData> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    params.append('period', period);
    if (date) params.append('date', date);

    const response = await fetch(`${BASE_URL}/payments?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}

export async function getResultPaymentStats(
    token: string,
    query: ResultPaymentStatsQuery = {}
): Promise<ResultPaymentStatsResponse> {
    const params = new URLSearchParams();

    if (query.examType) params.append('examType', query.examType);
    if (query.year) params.append('year', query.year);
    if (query.paymentStatus) params.append('paymentStatus', query.paymentStatus);
    if (query.page) params.append('page', query.page);
    if (query.limit) params.append('limit', query.limit);

    const queryString = params.toString();
    const endpoint = `${BASE_URL.split("/iirs-admin")[0]}/result-payment/all${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized access. Please log in again.');
        }
        throw new Error(`Failed to fetch result payment stats: ${response.statusText}`);
    }

    return response.json();
}

export async function login(email: string, password: string) {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (data.access_token) {
            return { success: true, message: 'Login Successful', access_token: data.access_token }
        } else {
            return { success: false, message: data.message, access_token: null }
        }
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}


export async function getProfile(token: string): Promise<UserProfile> {
    try {
        const response = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        return response.json();
    } catch (error) {
        console.error('Profile fetch failed:', error);
        throw error;
    }
}