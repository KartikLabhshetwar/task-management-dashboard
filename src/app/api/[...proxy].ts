import { NextRequest, NextResponse } from 'next/server'

const TARGET = process.env.BACKEND_URL || 'http://localhost:5000'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const response = await fetch(`${TARGET}${url.pathname}${url.search}`, {
    method: req.method,
    headers: req.headers,
    body: req.body
  })

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers
  })
}

export async function POST(req: NextRequest) {
  return GET(req)
}

export async function PUT(req: NextRequest) {
  return GET(req)
}

export async function DELETE(req: NextRequest) {
  return GET(req)
}