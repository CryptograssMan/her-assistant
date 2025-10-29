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
