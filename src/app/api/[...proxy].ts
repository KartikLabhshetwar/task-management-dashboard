import { NextRequest, NextResponse } from 'next/server'

const TARGET = 'https://task-management-dashboard-backend.onrender.com'

async function handler(req: NextRequest) {
  const url = new URL(req.url)
  const targetUrl = `${TARGET}${url.pathname}${url.search}`

  try {
    const headers = new Headers(req.headers)
    headers.set('Content-Type', 'application/json')

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
    })

    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      }
    })
  } catch (error) {
    console.error('API route error:', error)
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler