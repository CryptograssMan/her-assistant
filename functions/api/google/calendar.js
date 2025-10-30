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

    // Fetch calendar events
    const now = new Date().toISOString();
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=10&orderBy=startTime&singleEvents=true`,
      {
        headers: {
          'Authorization': `Bearer ${sessionData.tokens.access_token}`
        }
      }
    );

    if (!calendarResponse.ok) {
      const error = await calendarResponse.text();
      console.error('Calendar API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch calendar' }),
        { status: calendarResponse.status, headers: corsHeaders }
      );
    }

    const calendarData = await calendarResponse.json();
    
    const events = (calendarData.items || []).map(event => ({
      id: event.id,
      summary: event.summary || 'No Title',
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      description: event.description || '',
      location: event.location || ''
    }));

    return new Response(
      JSON.stringify(events),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error fetching calendar:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
