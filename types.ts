export interface TranscriptEntry {
  speaker: 'user' | 'her';
  text: string;
}

export enum ConversationStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  LISTENING = 'LISTENING',
  ERROR = 'ERROR',
}

export interface Email {
  id: string; // Changed to string as Google API uses strings
  sender: string;
  subject: string;
  snippet: string;
  isVip?: boolean;
}

export interface CalendarEvent {
  id: number;
  time: string;
  title: string;
  attendees: string[];
}

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
}

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  isDemo?: boolean;
}

// This type is a simplified representation of the LiveServerMessage from @google/genai
// It's added here because the frontend no longer imports the library directly.
export interface LiveServerMessage {
    serverContent?: {
        modelTurn?: {
            parts: {
                inlineData: {
                    data: string;
                    mimeType: string;
                };
            }[];
        };
        inputTranscription?: {
            text: string;
        };
        outputTranscription?: {
            text: string;
        };
        interrupted?: boolean;
        turnComplete?: boolean;
    };
    toolCall?: any;
}