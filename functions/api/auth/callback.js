export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return Response.redirect(url.origin + '/?error=no_code', 302);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: url.origin + '/api/auth/callback',
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return Response.redirect(url.origin + '/?error=token_failed', 302);
    }

    const tokens = await tokenResponse.json();
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    });

    if (!userResponse.ok) {
      console.error('User info fetch failed');
      return Response.redirect(url.origin + '/?error=userinfo_failed', 302);
    }

    const userInfo = await userResponse.json();
    
    // Create session data
    const sessionData = {
      user: {
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        isDemo: false
      },
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + (tokens.expires_in * 1000)
      }
    };

    // Store session in a cookie (temporary solution)
    const sessionJson = JSON.stringify(sessionData);
    const sessionBase64 = btoa(sessionJson);
    
    // Redirect back to home with session cookie
    return new Response(null, {
      status: 302,
      headers: {
        'Location': url.origin,
        'Set-Cookie': `session=${sessionBase64}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
      }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return Response.redirect(url.origin + '/?error=auth_failed', 302);
  }
}
