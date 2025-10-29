// Must export async function, NOT default export
export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({ 
      authenticated: false,
      timestamp: new Date().toISOString() 
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
