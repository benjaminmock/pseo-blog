import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import crypto from 'crypto';

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'test-secret');

export async function POST(request: NextRequest) {
  // Only allow in test environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { email, password } = await request.json();
    console.log('🔐 Test auth attempt for:', email);

    // Find user in database
    const user = db.prepare(`
      SELECT u.*, t.trainer_id
      FROM User u
      LEFT JOIN Trainers t ON u.email = t.email
      WHERE u.email = ?
    `).get(email) as any;

    console.log('👤 User found:', user ? 'Yes' : 'No');
    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    console.log('🔑 Verifying password...');
    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    console.log('✅ Password valid:', isValidPassword);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Clean up any existing test sessions for this user
    db.prepare('DELETE FROM Session WHERE userId = ? AND sessionToken LIKE "test-session-%"').run(user.id);

    // Create session token compatible with NextAuth
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session in database using NextAuth format
    const sessionId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO Session (id, sessionToken, userId, expires)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, sessionToken, user.id, expires.toISOString());

    // Create CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        trainerId: user.trainer_id
      },
      sessionToken,
      expires: expires.toISOString(),
      csrfToken
    });

    // Set NextAuth compatible session cookies
    response.cookies.set('next-auth.session-token', sessionToken, {
      expires,
      httpOnly: true,
      secure: false, // Set to false for localhost
      sameSite: 'lax',
      path: '/'
    });

    response.cookies.set('next-auth.csrf-token', csrfToken, {
      expires,
      httpOnly: false, // CSRF token needs to be accessible to client
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    // Set callback URL cookie for NextAuth compatibility
    response.cookies.set('next-auth.callback-url', 'http://localhost:3000', {
      expires,
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Only allow in test environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value;
    
    if (sessionToken) {
      // Delete session from database
      db.prepare('DELETE FROM Session WHERE sessionToken = ?').run(sessionToken);
    }

    const response = NextResponse.json({ success: true });
    
    // Clear session cookies
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('next-auth.csrf-token');

    return response;

  } catch (error) {
    console.error('Test logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}