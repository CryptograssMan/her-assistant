export async function onRequest(context) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Read session from cookie
    const cookies = context.request.headers.get('Cookie') || '';
    const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('session='));
    
    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ user: null, authenticated: false }),
        { status: 200, headers: corsHeaders }
      );
    }

    const sessionBase64 = sessionCookie.split('=')[1];
    const sessionJson = atob(sessionBase64);
    const sessionData = JSON.parse(sessionJson);
    
    // Check if token is expired
    if (sessionData.tokens.expires_at < Date.now()) {
      // Token expired - should refresh here
      return new Response(
        JSON.stringify({ user: null, authenticated: false }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Return user data
    return new Response(
      JSON.stringify({ 
        user: sessionData.user,
        authenticated: true 
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Session check error:', error);
    return new Response(
      JSON.stringify({ user: null, authenticated: false }),
      { status: 200, headers: corsHeaders }
    );
  }
}
