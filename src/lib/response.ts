import { NextResponse } from 'next/server'

export function response<T>(
  message: string,
  data?: T,
  status: number = 200,
  headers: Record<string, string> = {} // Optional headers
) {
  const response = NextResponse.json({ message, data }, { status })
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'N/A'
}
