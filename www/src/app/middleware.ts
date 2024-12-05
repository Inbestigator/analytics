import { NextResponse } from 'next/server'
 
export function middleware() {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}
 
export const config = {
  matcher: ["/api/analytics/recap", "/api/analytics/capture"],
}