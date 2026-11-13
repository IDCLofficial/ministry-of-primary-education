import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    return NextResponse.rewrite(new URL('/exam-portal-closed', request.url))
}

export const config = {
    matcher: '/exam-portal/:path*',
}
