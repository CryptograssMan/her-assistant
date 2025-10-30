export const fetchDashboardData = async () => {
  const [emailsRes, calendarRes, driveRes] = await Promise.all([
    fetch('/api/google/emails', { credentials: 'include' }),
    fetch('/api/google/calendar', { credentials: 'include' }),
    fetch('/api/google/drive', { credentials: 'include' })
  ]);

  if (!emailsRes.ok || !calendarRes.ok || !driveRes.ok) {
    throw new Error('Unauthorized');
  }

  const [emails, calendarEvents, driveFiles] = await Promise.all([
    emailsRes.json(),
    calendarRes.json(),
    driveRes.json()
  ]);

  return { emails, calendarEvents, driveFiles };
};
