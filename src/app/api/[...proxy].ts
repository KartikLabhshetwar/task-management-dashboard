import { NextRequest, NextResponse } from 'next/server'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const TARGET = process.env.BACKEND_URL || 'http://localhost:5000'

const proxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' },
})

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url!)
  const pathname = url.pathname.replace('/api', '')
  const apiReq = new NextApiRequest(req as any)
  const apiRes = new NextApiResponse({} as any)

  await runMiddleware(apiReq, apiRes, proxy)

  return new NextResponse(apiRes._body, {
    status: apiRes.statusCode,
    headers: apiRes.getHeaders() as HeadersInit,
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