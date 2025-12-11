import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export async function GET(request: NextRequest) {
  const oauth2Client = getOAuth2Client();
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (code) {
    // Handle callback from Google
    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      // Return tokens to client to store
      const redirectUrl = new URL('/', request.nextUrl.origin);
      redirectUrl.searchParams.set('tokens', JSON.stringify(tokens));
      
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error('Error getting tokens:', error);
      return NextResponse.redirect(new URL('/?error=auth_failed', request.nextUrl.origin));
    }
  }
  
  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent'
  });
  
  return NextResponse.json({ authUrl });
}
