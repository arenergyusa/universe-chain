import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 5, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 5000) {
    return NextResponse.json(
      { success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body too large' } },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Malformed JSON payload' } },
      { status: 400 }
    );
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload format' } },
      { status: 400 }
    );
  }

  try {
    const { name, email, message } = body as Record<string, unknown>;

    if (
      typeof name !== 'string' || name.trim() === '' ||
      typeof email !== 'string' || email.trim() === '' ||
      typeof message !== 'string' || message.trim() === ''
    ) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length > 100 || trimmedEmail.length > 255 || trimmedMessage.length > 2000) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Field length limit exceeded' } },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid email format' } },
        { status: 400 }
      );
    }

    const requestId = crypto.randomUUID();

    // Persist to database
    await db.contactMessage.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      }
    });

    console.log('Received and saved contact submission:', { requestId, timestamp: new Date().toISOString() });

    return NextResponse.json(
      { success: true, data: { requestId, message: 'Message delivered successfully' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
