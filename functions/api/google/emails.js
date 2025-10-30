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
    // Get session from cookie
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
    
    // Check if token expired
    if (sessionData.tokens.expires_at < Date.now()) {
      // TODO: Implement token refresh here
      return new Response(
        JSON.stringify({ error: 'Token expired' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Fetch emails from Gmail API
    const gmailResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread',
      {
        headers: {
          'Authorization': `Bearer ${sessionData.tokens.access_token}`
        }
      }
    );

    if (!gmailResponse.ok) {
      const error = await gmailResponse.text();
      console.error('Gmail API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch emails' }),
        { status: gmailResponse.status, headers: corsHeaders }
      );
    }

    const gmailData = await gmailResponse.json();
    
    // Fetch details for each message
    const emails = [];
    if (gmailData.messages) {
      for (const msg of gmailData.messages.slice(0, 5)) {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: {
              'Authorization': `Bearer ${sessionData.tokens.access_token}`
            }
          }
        );
        
        if (detailResponse.ok) {
          const detail = await detailResponse.json();
          const headers = detail.payload.headers;
          
          emails.push({
            id: detail.id,
            subject: headers.find(h => h.name === 'Subject')?.value || 'No Subject',
            from: headers.find(h => h.name === 'From')?.value || 'Unknown',
            snippet: detail.snippet,
            date: new Date(parseInt(detail.internalDate)).toISOString()
          });
        }
      }
    }

    return new Response(
      JSON.stringify(emails),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error fetching emails:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
