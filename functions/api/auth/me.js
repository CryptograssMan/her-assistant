export async function onRequest(context) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // For now, return not authenticated
  // Later you'll add real session checking logic
  return new Response(
    JSON.stringify({ 
      user: null,
      authenticated: false 
    }),
    { status: 200, headers: corsHeaders }
  );
}
