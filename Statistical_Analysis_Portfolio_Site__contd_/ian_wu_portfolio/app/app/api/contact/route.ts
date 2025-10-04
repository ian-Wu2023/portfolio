
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Save to database
    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        formType: 'contact',
        status: 'new'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      id: contactSubmission.id
    })
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
