export async function onRequestGet({ request }) {
  // Check session logic here
  return new Response(JSON.stringify({ authenticated: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
