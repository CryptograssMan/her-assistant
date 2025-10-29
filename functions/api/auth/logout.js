export async function onRequest(context) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Clear session (implement session clearing logic later)
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders }
  );
}
