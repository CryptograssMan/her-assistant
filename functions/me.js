export async function onRequestGet({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0'
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    console.log('/me endpoint called');
    
    // For now, return a simple response to test
    const userData = {
      authenticated: false,
      user: null,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(userData),
      { 
        status: 200,
        headers: corsHeaders 
      }
    );
    
  } catch (error) {
    console.error('/me endpoint error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: corsHeaders 
      }
    );
  }
}

// Also export for POST if needed
export async function onRequestPost(context) {
  return onRequestGet(context);
}
