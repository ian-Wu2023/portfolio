// This API route is not used in the static export
// The contact form directly opens Gmail instead

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { message: 'This endpoint is not available in static export' },
    { status: 501 }
  )
}
