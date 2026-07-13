import { UserProfile } from "@/app/portal/iirs/providers/AuthProvider";
import { StringDecoder } from "string_decoder";
import { ExamTypeLgaBreakdownResponse } from "./examTypeLgaBreakdown.types";

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
    /** Exam type -> search mode (`default` | `multiForm` | `batch`) -> totals. */
    breakdownBySearchMode: Record<string, Record<string, ResultPaymentExamTypeStats>>;
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

const ALL_PAYMENTS_PAGE_SIZE = 500;

/**
 * Every payment for the given filters, not just the first page.
 *
 * `/payments` caps a page at a server-side default (20) when no `limit` is sent, so callers that
 * aggregate across the whole set — charts, totals — must page through to the end rather than
 * trusting a single response.
 */
export async function getAllPaymentsData(
    token: string,
    date?: string,
    period: '1day' | '1week' | '1month' | '1year' | 'all' = 'all'
): Promise<PaymentsData> {
    const firstPage = await getPaymentsData(token, 1, ALL_PAYMENTS_PAGE_SIZE, date, period);

    const totalPages = firstPage.pagination?.pages ?? 1;
    if (totalPages <= 1) {
        return firstPage;
    }

    const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
            getPaymentsData(token, index + 2, ALL_PAYMENTS_PAGE_SIZE, date, period)
        )
    );

    const payments = [
        ...(firstPage.payments || []),
        ...remainingPages.flatMap(page => page.payments || []),
    ];

    return {
        payments,
        pagination: {
            page: 1,
            limit: payments.length,
            total: firstPage.pagination?.total ?? payments.length,
            pages: 1,
        },
    };
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

export interface PaymentBreakdownByExamType {
    count: number;
    totalAmount: number;
    amountPerStudent: number;
}

export interface PaymentBreakdownStats {
    totalAmount: number;
    amountByExamType: Record<string, PaymentBreakdownByExamType>;
}

export async function getPaymentBreakdownStats(token: string): Promise<PaymentBreakdownStats> {
    const endpoint = `${BASE_URL.split('/iirs-admin')[0]}/admin/result-payment-stats`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch payment breakdown: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data as PaymentBreakdownStats;
}

export async function getExamTypeLgaBreakdown(
    token: string,
    examType: string
): Promise<ExamTypeLgaBreakdownResponse> {
    const params = new URLSearchParams({ examType });

    const endpoint = `${BASE_URL.split('/iirs-admin')[0]}/admin/result-payment-stats/lga-breakdown?${params.toString()}`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || `Failed to fetch LGA breakdown: ${response.statusText}`);
    }

    const json = await response.json();
    return (json?.data ?? json) as ExamTypeLgaBreakdownResponse;
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