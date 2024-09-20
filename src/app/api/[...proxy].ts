import { NextRequest, NextResponse } from 'next/server'

const TARGET = 'https://task-management-dashboard-backend.onrender.com'

async function handler(req: NextRequest) {
  const url = new URL(req.url)
  try {
    const response = await fetch(`${TARGET}${url.pathname}${url.search}`, {
      method: req.method,
      headers: {
        ...req.headers,
        'Content-Type': 'application/json',
      },
      body: req.body
    })

    const data = await response.json()

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
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