import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
// FIX: Corrected the import to use the PascalCase member 'UpgradeWebSocket' as suggested by the error.
import { UpgradeWebSocket } from 'hono/ws';
import { GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage, Blob } from '@google/genai';


// ====================================================================================
//  CONFIGURE YOUR BACKEND ENVIRONMENT
// ====================================================================================
// These values should be set as secrets in your Cloudflare Worker dashboard.
// NEVER expose these in your frontend code.
//
// 1. GOOGLE_CLIENT_ID: Your Google OAuth Client ID.
// 2. GOOGLE_CLIENT_SECRET: Your Google OAuth Client Secret.
// 3. COOKIE_SECRET: A long, a random string (at least 32 characters) for encrypting
//    the session cookie. You can generate one using an online tool.
// 4. API_KEY: Your Google AI (Gemini) API key.
// ====================================================================================

type Bindings = {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  COOKIE_SECRET: string;
  API_KEY: string;
};

type Session = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: {
    name: string;
    email: string;
    picture: string;
  }
};

const app = new Hono<{ Bindings: Bindings }>();

const getCryptoKey = async (c: any) => {
    const secret = c.env.COOKIE_SECRET;
    if (secret.length < 32) {
        throw new Error("COOKIE_SECRET must be at least 32 characters long.");
    }
    const secretKeyData = new TextEncoder().encode(secret);
    return await crypto.subtle.importKey(
        'raw',
        secretKeyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
};

// Reusable function to get session from cookie
const getSession = async (c: any): Promise<Session | null> => {
    const encryptedSessionCookie = getCookie(c, 'auth_session');
    if (!encryptedSessionCookie) {
        return null;
    }
     try {
        const key = await getCryptoKey(c);
        const encryptedData = new Uint8Array(atob(encryptedSessionCookie).split('').map(char => char.charCodeAt(0)));
        const iv = encryptedData.slice(0, 12);
        const encryptedSession = encryptedData.slice(12);

        const decryptedSessionBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedSession
        );

        const session: Session = JSON.parse(new TextDecoder().decode(decryptedSessionBuffer));

        if (Date.now() > session.expiresAt) {
            // A real app would use the refresh token here
            deleteCookie(c, 'auth_session');
            return null;
        }
        return session;
    } catch (error) {
        console.error("Session decryption failed:", error);
        deleteCookie(c, 'auth_session');
        return null;
    }
}


// --- Authentication Routes ---

const auth = new Hono<{ Bindings: Bindings }>();

// Step 1: Redirect user to Google for sign-in
auth.get('/google', (c) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: new URL(c.req.url).origin + '/api/auth/google/callback',
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.readonly',
    access_type: 'offline', // Important to get a refresh token
    prompt: 'consent',
  })}`;
  return c.redirect(authUrl);
});


// Step 2: Google redirects back here with a code
auth.get('/google/callback', async (c) => {
    const code = c.req.query('code');
    if (!code) {
        return c.json({ error: 'Authorization code is missing' }, 400);
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                client_id: c.env.GOOGLE_CLIENT_ID,
                client_secret: c.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: new URL(c.req.url).origin + '/api/auth/google/callback',
                grant_type: 'authorization_code',
            }),
        });
        const tokens = await tokenResponse.json();
        
        if (tokens.error) {
            throw new Error(tokens.error_description);
        }

        // Fetch user profile
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const userData = await userResponse.json();

        // Create session object
        const session: Session = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Date.now() + (tokens.expires_in * 1000),
            user: {
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
            },
        };
        
        // Encrypt and set session cookie
        const key = await getCryptoKey(c);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedSession = new TextEncoder().encode(JSON.stringify(session));
        const encryptedSession = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encodedSession
        );

        const encryptedData = new Uint8Array(iv.length + encryptedSession.byteLength);
        encryptedData.set(iv);
        encryptedData.set(new Uint8Array(encryptedSession), iv.length);

        const base64EncryptedSession = btoa(String.fromCharCode(...encryptedData));

        setCookie(c, 'auth_session', base64EncryptedSession, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return c.redirect('/');

    } catch (error) {
        console.error('OAuth callback error:', error);
        return c.json({ error: 'Failed to authenticate with Google' }, 500);
    }
});


// Step 3: Endpoint for frontend to check if user is logged in
auth.get('/me', async (c) => {
    const session = await getSession(c);
    if (!session) {
         return c.json({ user: null }, 401);
    }
    return c.json({ user: session.user });
});

// Step 4: Logout
auth.post('/logout', (c) => {
    deleteCookie(c, 'auth_session', { path: '/' });
    return c.json({ success: true });
});

app.route('/api/auth', auth);


// --- Protected Data Route ---

app.get('/api/data', async (c) => {
    const session = await getSession(c);
    if (!session) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const accessToken = session.accessToken;

    try {
        // Fetch data from Google APIs in parallel
        const [emailsResponse, calendarResponse, driveResponse] = await Promise.all([
            fetch('https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:important', {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&timeMin=' + new Date().toISOString(), {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch('https://www.googleapis.com/drive/v3/files?pageSize=5&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime,webViewLink)', {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
        ]);

        if (!emailsResponse.ok || !calendarResponse.ok || !driveResponse.ok) {
            throw new Error('Failed to fetch data from Google APIs');
        }

        const emailList = await emailsResponse.json();
        const calendarData = await calendarResponse.json();
        const driveData = await driveResponse.json();

        // Process emails (fetch snippets)
        const emailDetailsPromises = (emailList.messages || []).map(async (msg: any) => {
            const detailRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`, {
                 headers: { Authorization: `Bearer ${accessToken}` },
            });
            const detail = await detailRes.json();
            const sender = detail.payload.headers.find((h:any) => h.name === 'From')?.value || 'Unknown Sender';
            const subject = detail.payload.headers.find((h:any) => h.name === 'Subject')?.value || 'No Subject';
            return { id: detail.id, sender, subject, snippet: detail.snippet };
        });

        const emails = await Promise.all(emailDetailsPromises);
        
        // Process calendar events
        const calendarEvents = (calendarData.items || []).map((event: any, index: number) => ({
            id: index + 1, // Use index as mock ID
            time: event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All day',
            title: event.summary,
            attendees: (event.attendees || []).map((a: any) => a.email.split('@')[0]), // Simplify names
        }));

        // Process drive files
        const driveFiles = (driveData.files || []).map((file: any) => ({
            id: file.id,
            name: file.name,
            modifiedTime: new Date(file.modifiedTime).toLocaleDateString(),
            webViewLink: file.webViewLink,
        }));

        return c.json({ emails, calendarEvents, driveFiles });

    } catch (error) {
        console.error("Failed to fetch Google API data:", error);
        return c.json({ error: 'Failed to fetch data' }, 500);
    }
});

// --- Gemini Live API WebSocket Proxy ---

// Hono v4 Middleware to protect the WebSocket route by checking the session
const sessionSocketMiddleware = async (c: any, next: Function) => {
    const session = await getSession(c);
    if (!session) {
        // For WebSockets, we can't send a redirect. We must return a normal response
        // to deny the upgrade request. The client will receive an error.
        return new Response('Unauthorized', { status: 401 });
    }
    // Session is valid, proceed to the WebSocket upgrader
    await next();
};

app.get(
    '/api/gemini/live',
    sessionSocketMiddleware,
    // FIX: Corrected the usage of the WebSocket upgrade handler to use the PascalCase member.
    UpgradeWebSocket((c) => {
        let geminiSessionPromise: Promise<any> | null = null;
    
        return {
            onMessage: async (evt, ws) => {
                const message = JSON.parse(evt.data as string);

                if (message.type === 'start') {
                    try {
                        // Use app.request to internally call our own /api/data endpoint.
                        // This reuses the logic and correctly forwards the auth cookie.
                        const dataResponse = await app.request('/api/data', { headers: c.req.raw.headers });
                        
                        // Check if the internal request was successful
                        if (!dataResponse.ok) {
                           console.error(`Internal /api/data call failed with status: ${dataResponse.status}`);
                           ws.close(1011, 'Internal authentication error');
                           return;
                        }

                        const { emails, calendarEvents, driveFiles } = await dataResponse.json();
                        
                        const vips = message.vips || [];
                        const vipListPrompt = vips.length > 0 ? `The user has defined these people as VIPs: ${vips.join(', ')}. Prioritize all communications from them.` : '';
                        const emailContext = `Here are the user's priority emails: ${JSON.stringify(emails.map((e: any) => ({from: e.sender, subject: e.subject})))}.`;
                        const calendarContext = `Here are the user's calendar events for today: ${JSON.stringify(calendarEvents.map((c: any) => ({title: c.title, time: c.time})))}.`;
                        const driveContext = `Here are the user's most recently modified files in Google Drive: ${JSON.stringify(driveFiles.map((f: any) => f.name))}.`;

                        const systemInstruction = `You are HER, a super executive assistant. You are professional, concise, and focused on helping executives be more productive. You have access to their email, calendar, and chat. You proactively flag important items and can compose replies for approval. Your responses should be direct and helpful.
Current context:
${vipListPrompt}
${emailContext}
${calendarContext}
${driveContext}
Do not mention that you have this context unless the user asks a question that requires it. Begin the conversation by saying 'HER, online. How can I help you?'.`;

                        const ai = new GoogleGenAI({ apiKey: c.env.API_KEY });
                        geminiSessionPromise = ai.live.connect({
                            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                            callbacks: {
                                onopen: () => { /* Connection to Gemini established */ },
                                onmessage: (msg: LiveServerMessage) => {
                                    ws.send(JSON.stringify(msg));
                                },
                                onerror: (err: ErrorEvent) => {
                                    console.error('Gemini error:', err);
                                    ws.close(1011, 'Gemini connection error');
                                },
                                onclose: () => {
                                    ws.close(1000, 'Gemini session closed');
                                },
                            },
                            config: {
                                responseModalities: [Modality.AUDIO],
                                inputAudioTranscription: {},
                                outputAudioTranscription: {},
                                speechConfig: {
                                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                                },
                                systemInstruction,
                            },
                        });
                        await geminiSessionPromise;
                    } catch(e) {
                         console.error("Failed to start Gemini session:", e);
                         ws.close(1011, 'Failed to initialize session');
                    }
                } else if (message.type === 'audio' && geminiSessionPromise) {
                     const geminiSession = await geminiSessionPromise;
                     const pcmBlob: Blob = {
                        data: message.data,
                        mimeType: 'audio/pcm;rate=16000',
                     };
                     geminiSession.sendRealtimeInput({ media: pcmBlob });
                }
            },
            onClose: async () => {
                if (geminiSessionPromise) {
                    const geminiSession = await geminiSessionPromise;
                    geminiSession.close();
                    console.log('Gemini session closed.');
                }
            },
            onError: (err) => {
                console.error('WebSocket error:', err);
            },
        };
    })
);

export default app;
