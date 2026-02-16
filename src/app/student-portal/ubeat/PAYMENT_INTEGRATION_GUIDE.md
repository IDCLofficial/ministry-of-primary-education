# Payment Gateway Integration Guide

This guide explains how to integrate a real payment gateway (Paystack, Flutterwave, etc.) for the UBEAT alternative form feature.

## Overview

When students don't have their exam number, they can use the alternative form by providing:
- Full Name
- School Name
- LGA
- Exam Year

A payment of **₦500** is required to search and access their results.

## Integration Steps

### Option 1: Paystack Integration

#### 1. Install Paystack React SDK

```bash
npm install react-paystack
```

#### 2. Update Environment Variables

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

#### 3. Update `src/app/student-portal/ubeat/page.tsx`

Replace the `handleAlternativeFormSubmit` function:

```typescript
import { usePaystackPayment } from 'react-paystack';

export default function UBEATLoginPage() {
    // ... existing code ...

    const config = {
        reference: `UBEAT-${Date.now()}`,
        email: 'student@temp.com', // Or collect email in form
        amount: 50000, // ₦500 in kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        metadata: {
            custom_fields: [
                {
                    display_name: "Student Name",
                    variable_name: "student_name",
                    value: altFormData.fullName
                },
                {
                    display_name: "School Name",
                    variable_name: "school_name",
                    value: altFormData.schoolName
                },
                {
                    display_name: "LGA",
                    variable_name: "lga",
                    value: altFormData.lga
                },
                {
                    display_name: "Exam Year",
                    variable_name: "exam_year",
                    value: altFormData.examYear
                }
            ]
        }
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = (reference: any) => {
        // Payment successful
        localStorage.setItem('payment_reference', reference.reference);
        localStorage.setItem('ubeat_alt_form_data', JSON.stringify(altFormData));
        router.push(`/student-portal/ubeat/payment?ref=${reference.reference}&status=success`);
    };

    const onClose = () => {
        toast.error('Payment cancelled');
    };

    const handleAlternativeFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isAltFormValid) {
            toast.error('Please fill in all fields correctly');
            return;
        }

        // Initialize Paystack payment
        initializePayment(onSuccess, onClose);
    };

    // ... rest of code ...
}
```

#### 4. Update `src/app/student-portal/ubeat/payment/page.tsx`

```typescript
'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isVerifying, setIsVerifying] = useState(true)
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed'>('failed')
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

    useEffect(() => {
        const verifyPayment = async () => {
            const reference = searchParams.get('ref')
            const status = searchParams.get('status')

            if (status !== 'success' || !reference) {
                setPaymentStatus('failed')
                setIsVerifying(false)
                return
            }

            try {
                // Verify payment with backend
                const response = await fetch(`${API_BASE_URL}/payment/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reference })
                })

                const data = await response.json()

                if (data.status === 'success') {
                    // Get stored form data
                    const formData = localStorage.getItem('ubeat_alt_form_data')
                    if (!formData) {
                        throw new Error('Form data not found')
                    }

                    // Search for student using alternative details
                    const studentResponse = await fetch(`${API_BASE_URL}/ubeat-student/search-by-details`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: formData
                    })

                    if (!studentResponse.ok) {
                        throw new Error('Student not found')
                    }

                    const studentData = await studentResponse.json()

                    // Store student data
                    localStorage.setItem('student_data', JSON.stringify(studentData))
                    localStorage.setItem('student_exam_no', studentData.examNo)
                    localStorage.setItem('selected_exam_type', 'ubeat')
                    localStorage.setItem('payment_verified', 'true')
                    localStorage.removeItem('ubeat_alt_form_data')

                    setPaymentStatus('success')

                    // Redirect to UBEAT dashboard
                    setTimeout(() => {
                        toast.success('Access granted! Redirecting to dashboard...')
                        router.push('/student-portal/ubeat/dashboard')
                    }, 2000)
                } else {
                    setPaymentStatus('failed')
                }
            } catch (error) {
                console.error('Verification error:', error)
                setPaymentStatus('failed')
            } finally {
                setIsVerifying(false)
            }
        }

        verifyPayment()
    }, [searchParams, router, API_BASE_URL])

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying payment...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center p-4">
            {paymentStatus === 'success' ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-4">Your results are now available</p>
                    <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                    <p className="text-gray-600 mb-6">We couldn't verify your payment</p>
                    <button
                        onClick={() => router.push('/student-portal/ubeat')}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
        </div>}>
            <PaymentContent />
        </Suspense>
    )
}
```

### Option 2: Flutterwave Integration

#### 1. Install Flutterwave React SDK

```bash
npm install flutterwave-react-v3
```

#### 2. Update Environment Variables

```env
NEXT_PUBLIC_FLW_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxx
```

#### 3. Update `src/app/student-portal/ubeat/page.tsx`

```typescript
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

export default function UBEATLoginPage() {
    // ... existing code ...

    const config = {
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY!,
        tx_ref: `UBEAT-${Date.now()}`,
        amount: 500,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: 'student@temp.com',
            name: altFormData.fullName,
        },
        customizations: {
            title: 'UBEAT Result Access',
            description: 'Payment for result access',
            logo: '/images/ministry-logo.png',
        },
        meta: {
            fullName: altFormData.fullName,
            schoolName: altFormData.schoolName,
            lga: altFormData.lga,
            examYear: altFormData.examYear,
        }
    };

    const handleFlutterPayment = useFlutterwave(config);

    const handleAlternativeFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isAltFormValid) {
            toast.error('Please fill in all fields correctly');
            return;
        }

        handleFlutterPayment({
            callback: (response) => {
                console.log(response);
                if (response.status === 'successful') {
                    localStorage.setItem('payment_reference', response.transaction_id);
                    localStorage.setItem('ubeat_alt_form_data', JSON.stringify(altFormData));
                    router.push(`/student-portal/ubeat/payment?ref=${response.transaction_id}&status=success`);
                }
                closePaymentModal();
            },
            onClose: () => {
                toast.error('Payment cancelled');
            },
        });
    };

    // ... rest of code ...
}
```

## Backend API Requirements

### 1. Payment Verification Endpoint

```typescript
// POST /payment/verify
{
  reference: string
}

// Response
{
  status: 'success' | 'failed',
  amount: number,
  currency: string,
  metadata: object
}
```

### 2. Student Search Endpoint

```typescript
// POST /ubeat-student/search-by-details
{
  fullName: string,
  schoolName: string,
  lga: string,
  examYear: string
}

// Response
{
  _id: string,
  name: string,
  examNo: string,
  school: string,
  subjects: object,
  ...
}
```

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Always verify payments** on the backend before releasing results
3. **Implement webhook handlers** for payment notifications
4. **Log all transactions** for auditing
5. **Rate limit** payment attempts to prevent abuse
6. **Validate form data** on both client and server
7. **Use HTTPS** for all payment-related requests

## Testing

### Test Cards (Paystack)

```
Card Number: 4084 0840 8408 4081
CVV: 408
Expiry: 01/30
PIN: 0000
```

### Test Cards (Flutterwave)

```
Card Number: 5531 8866 5214 2950
CVV: 564
Expiry: 09/32
PIN: 3310
OTP: 12345
```

## Webhook Setup

### Paystack Webhook

```typescript
// pages/api/webhooks/paystack.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;
        
        if (event.event === 'charge.success') {
            // Payment successful - process student search
            const { reference, metadata } = event.data;
            
            // Search for student and grant access
            // ...
        }
    }

    res.status(200).json({ received: true });
}
```

## Troubleshooting

### Payment not verifying
- Check that webhook URL is correctly configured
- Verify API keys are correct
- Check backend logs for errors

### Student not found after payment
- Verify form data is correctly stored
- Check backend search logic
- Ensure student exists in database

### Payment modal not opening
- Verify public key is loaded
- Check browser console for errors
- Ensure payment SDK is properly imported

## Support

For integration help:
- Paystack: https://paystack.com/docs
- Flutterwave: https://developer.flutterwave.com/docs
