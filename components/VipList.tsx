
import React, { useState } from 'react';

interface VipListProps {
  vips: string[];
  onAddVip: (name: string) => void;
  onRemoveVip: (name: string) => void;
}

const VipList: React.FC<VipListProps> = ({ vips, onAddVip, onRemoveVip }) => {
  const [newVipName, setNewVipName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVip(newVipName.trim());
    setNewVipName('');
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-6 text-pink-400 tracking-tight">VIP Contacts</h2>
      
      <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
        <input
          type="text"
          value={newVipName}
          onChange={(e) => setNewVipName(e.target.value)}
          placeholder="Add a new VIP name..."
          className="flex-grow bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
          aria-label="New VIP Name"
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newVipName.trim()}
        >
          Add
        </button>
      </form>

      <div className="space-y-3">
        {vips.length > 0 ? (
          vips.map(vip => (
            <div key={vip} className="flex justify-between items-center bg-gray-800/60 p-3 rounded-lg animate-fade-in">
              <span className="font-medium text-gray-200">{vip}</span>
              <button 
                onClick={() => onRemoveVip(vip)}
                className="text-gray-500 hover:text-red-400 transition-colors"
                aria-label={`Remove ${vip}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic text-center py-4">No VIPs added yet.</p>
        )}
      </div>
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
  );
};

export default VipList;
