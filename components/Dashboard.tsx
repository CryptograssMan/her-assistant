import React from 'react';
import type { Email, CalendarEvent, DriveFile } from '../types';
import VipList from './VipList';

interface DashboardProps {
  vips: string[];
  onAddVip: (name: string) => void;
  onRemoveVip: (name: string) => void;
  emails: Email[];
  calendarEvents: CalendarEvent[];
  driveFiles: DriveFile[];
  isLoading: boolean;
  error: string | null;
}

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const SkeletonLoader: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <div className="h-8 bg-gray-800 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="space-y-4">
                <div className="h-20 bg-gray-800/60 rounded-lg animate-pulse"></div>
                <div className="h-20 bg-gray-800/60 rounded-lg animate-pulse"></div>
            </div>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <div className="h-8 bg-gray-800 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="space-y-3">
                <div className="h-24 bg-gray-800/60 rounded-lg animate-pulse"></div>
                <div className="h-24 bg-gray-800/60 rounded-lg animate-pulse"></div>
            </div>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <div className="h-8 bg-gray-800 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="space-y-3">
                <div className="h-16 bg-gray-800/60 rounded-lg animate-pulse"></div>
                <div className="h-16 bg-gray-800/60 rounded-lg animate-pulse"></div>
                <div className="h-16 bg-gray-800/60 rounded-lg animate-pulse"></div>
            </div>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ vips, onAddVip, onRemoveVip, emails, calendarEvents, driveFiles, isLoading, error }) => {
    
    const priorityEmails = emails.map(email => {
        const isVip = vips.some(vip => email.sender.toLowerCase().includes(vip.toLowerCase()));
        return { ...email, isVip };
    }).sort((a, b) => (b.isVip ? 1 : 0) - (a.isVip ? 1 : 0));

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Good Morning</h1>
        <p className="text-gray-400 mt-2 text-lg">Here’s what’s on your plate today.</p>
      </div>

      {isLoading && <SkeletonLoader />}
      {error && <div className="text-center text-red-500 bg-red-900/20 p-4 rounded-lg">{error}</div>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {/* Calendar Section */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-pink-400">
              <CalendarIcon />
              Today's Agenda
            </h2>
            <div className="space-y-4">
              {calendarEvents.length > 0 ? calendarEvents.map(event => (
                <div key={event.id} className="p-4 bg-gray-800/60 rounded-lg">
                  <p className="font-bold text-purple-400">{event.time}</p>
                  <p className="font-semibold text-gray-200">{event.title}</p>
                  <p className="text-sm text-gray-400">{event.attendees.join(', ')}</p>
                </div>
              )) : <p className="text-gray-500">Your calendar is clear today.</p>}
            </div>
          </div>

          {/* Email Section */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-pink-400">
              <MailIcon />
              Priority Inbox
            </h2>
            <div className="space-y-3">
              {priorityEmails.length > 0 ? priorityEmails.map(email => (
                <div key={email.id} className="p-4 bg-gray-800/60 rounded-lg border-l-4 border-transparent hover:border-purple-500 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-200">{email.sender}</p>
                    {email.isVip && <span className="text-xs font-bold bg-pink-500 text-white px-2 py-1 rounded-full">VIP</span>}
                  </div>
                  <p className="font-medium text-gray-300 mt-1">{email.subject}</p>
                  <p className="text-sm text-gray-500 mt-1 truncate">{email.snippet}</p>
                </div>
              )) : <p className="text-gray-500">Your inbox is clear.</p>}
            </div>
          </div>
          
           {/* Drive Section */}
           <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-pink-400">
                <FileIcon />
                Recent Files
            </h2>
            <div className="space-y-3">
              {driveFiles.length > 0 ? driveFiles.map(file => (
                <a key={file.id} href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-800/60 rounded-lg hover:bg-gray-800/80 transition-colors duration-200">
                  <p className="font-semibold text-gray-200 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">Modified: {file.modifiedTime}</p>
                </a>
              )) : <p className="text-gray-500">No recent files found.</p>}
            </div>
          </div>
        </div>
      )}
      
      <VipList vips={vips} onAddVip={onAddVip} onRemoveVip={onRemoveVip} />
    </div>
  );
};

export default Dashboard;