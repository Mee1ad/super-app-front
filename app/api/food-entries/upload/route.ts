import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create new FormData for backend
    const backendFormData = new FormData()
    backendFormData.append('file', file)

    // Get auth headers from the request
    const authHeader = request.headers.get('authorization')
    const headers: HeadersInit = {}
    if (authHeader) {
      headers['authorization'] = authHeader
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    // Forward the request to the backend
    const backendResponse = await fetch(`${API_BASE_URL}/food-entries/upload`, {
      method: 'POST',
      headers,
      body: backendFormData
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      return NextResponse.json(
        { error: `Backend error: ${errorText}` },
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    return NextResponse.json(result, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 