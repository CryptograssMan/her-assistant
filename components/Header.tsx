import React from 'react';
import type { GoogleUser } from '../types';

interface HeaderProps {
    isAuthenticated: boolean;
    user: GoogleUser | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, user, onLogout }) => {
    return (
        <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                        HER
                    </h1>
                </div>

                {isAuthenticated && user && (
                    <div className="flex items-center gap-4">
                         <img 
                            src={user.picture} 
                            alt={user.name}
                            className="w-10 h-10 rounded-full border-2 border-gray-700" 
                         />
                        <button 
                            onClick={onLogout}
                            className="px-4 py-2 text-sm font-semibold text-gray-400 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;