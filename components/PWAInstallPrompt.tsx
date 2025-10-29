import React from 'react';

interface PWAInstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstall, onDismiss }) => {
  return (
    <div 
        className="fixed bottom-4 right-4 z-50 w-full max-w-sm p-5 bg-gray-900/80 border border-gray-700 rounded-2xl shadow-2xl shadow-purple-900/30 backdrop-blur-lg animate-slide-in-up"
        role="dialog"
        aria-labelledby="pwa-install-title"
        aria-describedby="pwa-install-description"
    >
      <button 
        onClick={onDismiss} 
        className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
        aria-label="Dismiss install prompt"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">
            <DownloadIcon />
        </div>
        <div>
          <h3 id="pwa-install-title" className="font-bold text-lg text-white">Install HER on your device</h3>
          <p id="pwa-install-description" className="text-sm text-gray-400 mt-1">Add HER to your home screen for a faster, native app experience.</p>
        </div>
      </div>
      
      <div className="mt-5">
         <button 
            onClick={onInstall} 
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
         >
           Add to Home Screen
         </button>
      </div>
      <style>{`
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;
