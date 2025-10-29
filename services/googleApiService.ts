import type { Email, CalendarEvent, DriveFile } from '../types';

interface DashboardData {
    emails: Email[];
    calendarEvents: CalendarEvent[];
    driveFiles: DriveFile[];
}

/**
 * Fetches dashboard data (emails, calendar events) from our secure backend.
 * The backend handles the authentication and calls the Google APIs.
 */
export const fetchDashboardData = async (): Promise<DashboardData> => {
    console.log('Fetching dashboard data from secure backend...');
    const response = await fetch('/api/data');

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized: Session may be expired.');
        }
        throw new Error('Failed to fetch dashboard data from the server.');
    }
    return response.json();
};

/**
 * Provides mock data for the demo mode.
 */
export const getMockData = (): DashboardData => {
    const mockEmails: Email[] = [
        {
            id: '1',
            sender: 'Elon Musk',
            subject: 'Re: Project Starship Update',
            snippet: '"Let\'s connect tomorrow to discuss the new thruster design. I have some ideas I want to run by the team."',
        },
        {
            id: '2',
            sender: 'GitHub',
            subject: '[Project HER] New pull request from user: deploy-bot',
            snippet: 'A new pull request has been opened for Project HER. Please review the changes.',
        },
        {
            id: '3',
            sender: 'Sam Altman',
            subject: 'Thoughts on the AGI roadmap',
            snippet: 'Following up on our conversation, I\'ve attached the revised roadmap. Would love to get your feedback before the board meeting.',
        },
        {
            id: '4',
            sender: 'Your Boss',
            subject: 'Q3 Performance Review',
            snippet: 'Hi, please find a time on my calendar to go over your Q3 performance review. Let me know what works.',
        },
    ];

    const mockCalendarEvents: CalendarEvent[] = [
        {
            id: 1,
            time: '10:00 AM - 10:30 AM',
            title: 'Project Starship Sync',
            attendees: ['Elon Musk', 'Lead Engineer', 'You'],
        },
        {
            id: 2,
            time: '1:00 PM - 2:00 PM',
            title: 'Q3 Board Meeting Prep',
            attendees: ['Sam Altman', 'CFO', 'You'],
        },
        {
            id: 3,
            time: '4:30 PM - 5:00 PM',
            title: 'Dentist Appointment',
            attendees: ['You'],
        },
    ];

    const mockDriveFiles: DriveFile[] = [
        {
            id: '1',
            name: 'Q4 Strategy Presentation.pptx',
            modifiedTime: 'Today',
            webViewLink: '#',
        },
        {
            id: '2',
            name: 'Project HER - Product Brief.docx',
            modifiedTime: 'Yesterday',
            webViewLink: '#',
        },
        {
            id: '3',
            name: 'Competitor Analysis Q3.xlsx',
            modifiedTime: 'Yesterday',
            webViewLink: '#',
        },
    ];

    return { emails: mockEmails, calendarEvents: mockCalendarEvents, driveFiles: mockDriveFiles };
}