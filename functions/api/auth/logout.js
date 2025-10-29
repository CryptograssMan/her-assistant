export async function onRequest(context) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Clear session cookie
  return new Response(
    JSON.stringify({ success: true }),
    { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
      }
    }
  );
}
