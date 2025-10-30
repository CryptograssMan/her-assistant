export async function onRequest(context) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const cookies = context.request.headers.get('Cookie') || '';
    const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('session='));
    
    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const sessionBase64 = sessionCookie.split('=')[1];
    const sessionJson = atob(sessionBase64);
    const sessionData = JSON.parse(sessionJson);
    
    if (sessionData.tokens.expires_at < Date.now()) {
      return new Response(
        JSON.stringify({ error: 'Token expired' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Fetch Drive files
    const driveResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=10&orderBy=modifiedTime desc&fields=files(id,name,mimeType,modifiedTime,webViewLink)',
      {
        headers: {
          'Authorization': `Bearer ${sessionData.tokens.access_token}`
        }
      }
    );

    if (!driveResponse.ok) {
      const error = await driveResponse.text();
      console.error('Drive API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch drive files' }),
        { status: driveResponse.status, headers: corsHeaders }
      );
    }

    const driveData = await driveResponse.json();
    
    const files = (driveData.files || []).map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink
    }));

    return new Response(
      JSON.stringify(files),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error fetching drive files:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
