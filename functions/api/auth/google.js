export async function onRequest(context) {
  const clientId = context.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${new URL(context.request.url).origin}/api/auth/callback`;
  
  // Build Google OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/drive.readonly');
  authUrl.searchParams.set('access_type', 'offline');
  
  // Redirect to Google OAuth
  return Response.redirect(authUrl.toString(), 302);
}
