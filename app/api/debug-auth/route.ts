import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  const authStatus = getAuthStatus(request)
  const shouldUseMock = shouldUseMockData(request)
  
  return NextResponse.json({
    authStatus,
    shouldUseMock,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  })
} 