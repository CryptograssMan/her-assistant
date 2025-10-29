export async function onRequest(context) {
  // This will handle the OAuth callback from Google
  // For now, just redirect back to home
  return Response.redirect(new URL(context.request.url).origin, 302);
}
