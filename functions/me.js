export async function onRequestGet({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Session check logic
    const response = {
      authenticated: false,
      user: null,
      message: "Session endpoint working"
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: corsHeaders 
      }
    );
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: corsHeaders 
      }
    );
  }
}
