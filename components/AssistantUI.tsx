
import React, { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '../types';
import { ConversationStatus } from '../types';

interface AssistantUIProps {
  status: ConversationStatus;
  transcripts: TranscriptEntry[];
  onStart: () => void;
  onStop: () => void;
}

const AssistantUI: React.FC<AssistantUIProps> = ({ status, transcripts, onStart, onStop }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInteracting = status !== ConversationStatus.IDLE && status !== ConversationStatus.ERROR;
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const getStatusIndicator = () => {
    switch(status) {
      case ConversationStatus.CONNECTING:
        return <div className="text-yellow-400">Connecting...</div>;
      case ConversationStatus.LISTENING:
        return <div className="text-green-400 flex items-center gap-2"><span>Listening</span> <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span></div>;
      case ConversationStatus.ERROR:
        return <div className="text-red-500">Connection Error</div>;
      default:
        return <div className="text-gray-400">Press to start</div>;
    }
  }

  return (
    <>
      <div className={`fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-opacity duration-300 ${isInteracting ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onStop}></div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 sm:p-8 flex flex-col items-center z-50">
        <div className={`w-full max-w-2xl transition-all duration-300 ${isInteracting ? 'max-h-96' : 'max-h-0'}`}>
          <div ref={scrollRef} className="overflow-y-auto h-full p-4 space-y-4">
             {transcripts.map((entry, index) => (
              <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-sm md:max-w-md p-3 rounded-2xl ${entry.speaker === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                  <p className="font-medium text-sm leading-tight">{entry.text || '...'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
           <button
            onClick={isInteracting ? onStop : onStart}
            disabled={status === ConversationStatus.CONNECTING}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/50 transition-transform duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
          >
            {status === ConversationStatus.LISTENING && <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-75"></div>}
            
            {isInteracting ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                <path d="M5.5 10a.5.5 0 00-1 0v.5a6 6 0 1011 0v-.5a.5.5 0 00-1 0V11a5 5 0 01-10 0v-.5z" />
              </svg>
            )}
           
          </button>
          <div className="text-sm font-medium">{getStatusIndicator()}</div>
        </div>
      </div>
    </>
  );
};

export default AssistantUI;
