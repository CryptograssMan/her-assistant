import React from 'react';

interface LoginScreenProps {
  onLogin: () => void;
  onLoginDemo: () => void;
  isLoading: boolean;
  error: string | null;
}

const GoogleIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.283,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onLoginDemo, isLoading, error }) => {

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="max-w-md">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
          Welcome to HER
        </h1>
        <p className="text-gray-400 mt-4 text-lg">
          Connect your Google Account to unlock your Super Executive Assistant. HER needs access to your Email and Calendar to proactively manage your day.
        </p>
        <div className="mt-8">
           {error && (
            <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4 text-left animate-fade-in">
                <p className="font-semibold">Authentication Error</p>
                <p className="text-sm">{error}</p>
            </div>
           )}
          <button
            onClick={onLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-lg bg-gray-200 text-gray-800 font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking session...
              </>
            ) : (
              <>
                <GoogleIcon />
                Connect Google Account
              </>
            )}
          </button>
          {!isLoading && (
            <button
              onClick={onLoginDemo}
              className="w-full mt-4 px-6 py-4 rounded-lg bg-gray-700 text-gray-200 font-bold hover:bg-gray-600 transition-colors animate-fade-in"
            >
              Continue in Demo Mode
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-4">
          By connecting your account, you agree to allow HER to securely access your data.
        </p>
         <style>{`
            @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
            }
        `}</style>
      </div>
    </div>
  );
};

export default LoginScreen;
