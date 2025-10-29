import React, { useState, useCallback, useRef, useEffect } from 'react';
import PRDDisplay from './components/PRDDisplay';
import AssistantUI from './components/AssistantUI';
import { startConversation, LiveSession } from './services/geminiService';
import type { TranscriptEntry, Email, CalendarEvent, DriveFile } from './types';
import { ConversationStatus } from './types';
import { LiveServerMessage } from './types';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { fetchDashboardData } from './services/googleApiService';
import PWAInstallPrompt from './components/PWAInstallPrompt';


const App: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    signIn, 
    signOut, 
    isLoading: isAuthLoading,
    error: authError,
    isDemo,
    signInAsDemoUser
  } = useGoogleAuth();
  
  const [emails, setEmails] = useState<Email[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [status, setStatus] = useState<ConversationStatus>(ConversationStatus.IDLE);
  const [vips, setVips] = useState<string[]>(['Elon Musk', 'Sam Altman', 'Your Boss']);
  const sessionRef = useRef<LiveSession | null>(null);
  const userTranscriptRef = useRef('');
  const modelTranscriptRef = useRef('');

  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e);
      // Only show the prompt if the app is not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (!installPromptEvent) return;
    // Show the browser's installation prompt
    installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then(() => {
        setInstallPromptEvent(null);
        setShowInstallPrompt(false);
    });
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
  };


  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        setIsLoadingData(true);
        setDataError(null);
        try {
          if (isDemo) {
            // In demo mode, we can use a service that returns mock data
            const { getMockData } = await import('./services/googleApiService');
            const { emails, calendarEvents, driveFiles } = getMockData();
            setEmails(emails);
            setCalendarEvents(calendarEvents);
            setDriveFiles(driveFiles);
          } else {
            // In real mode, fetch from our secure backend
            const { emails, calendarEvents, driveFiles } = await fetchDashboardData();
            setEmails(emails);
            setCalendarEvents(calendarEvents);
            setDriveFiles(driveFiles);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
          setDataError("Failed to load your data. Your session may have expired. Please try logging in again.");
          if (error instanceof Error && error.message.includes('Unauthorized')) {
            signOut(); // Log out the user if session is invalid
          }
        } finally {
          setIsLoadingData(false);
        }
      } else {
        // Clear data on logout
        setEmails([]);
        setCalendarEvents([]);
        setDriveFiles([]);
      }
    };
    loadData();
  }, [isAuthenticated, isDemo, signOut]);


  const handleAddVip = (name: string) => {
    if (name && !vips.includes(name)) {
      setVips(prevVips => [...prevVips, name]);
    }
  };

  const handleRemoveVip = (nameToRemove: string) => {
    setVips(prevVips => prevVips.filter(name => name !== nameToRemove));
  };

  const onMessage = useCallback((message: LiveServerMessage) => {
    let userTextChanged = false;
    let modelTextChanged = false;

    if (message.serverContent?.inputTranscription) {
      const text = message.serverContent.inputTranscription.text;
      userTranscriptRef.current += text;
      userTextChanged = true;
    }
    if (message.serverContent?.outputTranscription) {
      const text = message.serverContent.outputTranscription.text;
      modelTranscriptRef.current += text;
      modelTextChanged = true;
    }

    setTranscripts(prev => {
      const newTranscripts = [...prev];
      if (userTextChanged) {
        if (newTranscripts.length > 0 && newTranscripts[newTranscripts.length - 1].speaker === 'user') {
          newTranscripts[newTranscripts.length - 1].text = userTranscriptRef.current;
        } else {
          newTranscripts.push({ speaker: 'user', text: userTranscriptRef.current });
        }
      }
      if (modelTextChanged) {
         if (newTranscripts.length > 0 && newTranscripts[newTranscripts.length - 1].speaker === 'her') {
          newTranscripts[newTranscripts.length - 1].text = modelTranscriptRef.current;
        } else {
          newTranscripts.push({ speaker: 'her', text: modelTranscriptRef.current });
        }
      }
      return newTranscripts;
    });

    if (message.serverContent?.turnComplete) {
      userTranscriptRef.current = '';
      modelTranscriptRef.current = '';
    }
  }, []);

  const onError = useCallback((e: Event) => {
    console.error('Session error:', e);
    setStatus(ConversationStatus.ERROR);
    sessionRef.current = null;
  }, []);

  const onClose = useCallback(() => {
    setStatus(ConversationStatus.IDLE);
    sessionRef.current = null;
  }, []);

  const handleStartConversation = async () => {
    if (sessionRef.current) return;
    setStatus(ConversationStatus.CONNECTING);
    try {
      setTranscripts([]);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const session = await startConversation({
        onMessage,
        onError,
        onClose,
        stream,
        vips,
      });
      sessionRef.current = session;
      setStatus(ConversationStatus.LISTENING);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setStatus(ConversationStatus.ERROR);
    }
  };

  const handleStopConversation = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    setStatus(ConversationStatus.IDLE);
  };
  
  const handleLogin = () => {
    signIn();
  };

  const handleDemoLogin = () => {
    signInAsDemoUser();
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 selection:bg-purple-500 selection:text-white">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Header isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        
        {isAuthenticated ? (
          <>
            <div className="space-y-12 mt-16">
               <Dashboard
                vips={vips}
                onAddVip={handleAddVip}
                onRemoveVip={handleRemoveVip}
                emails={emails}
                calendarEvents={calendarEvents}
                driveFiles={driveFiles}
                isLoading={isLoadingData}
                error={dataError}
              />
              <PRDDisplay />
            </div>
            <AssistantUI
              status={status}
              transcripts={transcripts}
              onStart={handleStartConversation}
              onStop={handleStopConversation}
            />
          </>
        ) : (
          <LoginScreen 
            onLogin={handleLogin} 
            onLoginDemo={handleDemoLogin}
            isLoading={isAuthLoading} 
            error={authError} 
          />
        )}
      </main>
      {showInstallPrompt && (
        <PWAInstallPrompt 
          onInstall={handleInstall}
          onDismiss={handleDismissInstall}
        />
      )}
    </div>
  );
};

export default App;