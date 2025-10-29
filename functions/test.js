export async function onRequestGet() {
  return new Response('FUNCTION WORKS!', {
    headers: { 'Content-Type': 'text/plain' }
  });
}
