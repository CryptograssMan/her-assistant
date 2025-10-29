import React from 'react';

const PRDDisplay: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-6 text-pink-400 tracking-tight">Product Requirements: HER Assistant</h2>

      <div className="space-y-8 text-gray-300">
        <Section title="1. Introduction & Vision">
          <p>
            HER is a "Super Executive Assistant" designed for the modern, busy professional. She streamlines workflows by integrating with essential communication tools (email, calendar, chat) and uses advanced AI to prioritize tasks, manage schedules, and draft communications. The vision is to create an indispensable, proactive partner that enhances executive productivity, delivered through a seamless, voice-first Progressive Web App (PWA).
          </p>
        </Section>

        <Section title="2. Target Audience">
          <p>
            The primary users are high-level executives, entrepreneurs, and managers who are deeply integrated into the Google Workspace ecosystem. They are tech-savvy, value efficiency, and prefer intuitive, low-friction interfaces. The "GEN Z friendly" design approach aims to make the app feel modern, fast, and visually appealing, moving away from traditional, stuffy corporate software.
          </p>
        </Section>

        <Section title="3. Core Features (MVP)">
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Real-Time Voice Conversation:</strong> Users interact with HER primarily through voice, powered by the Gemini 2.5 Native Audio (Live API) for a natural, low-latency conversational experience.
            </li>
             <li>
              <strong>Secure Google Account Integration:</strong> The application uses a secure, server-side OAuth 2.0 flow to connect to the user's Google Account. All API keys and user tokens are stored securely on the backend, never exposed to the client. HER has read-only access to:
                <ul className="list-[circle] list-inside ml-6 mt-2 space-y-1">
                    <li><strong>Gmail:</strong> To read and prioritize important emails.</li>
                    <li><strong>Google Calendar:</strong> To provide daily agenda briefings.</li>
                    <li><strong>Google Drive:</strong> To access and answer questions about recent files.</li>
                </ul>
            </li>
            <li>
              <strong>Proactive Intelligence:</strong> For the MVP, HER will operate on a user's single account. It will use the live data context to flag important items based on a clear hierarchy:
              <ul className="list-[circle] list-inside ml-6 mt-2 space-y-1">
                  <li>
                      <strong>Email Prioritization:</strong> Identifying and flagging emails based on importance:
                      <ul className="list-[square] list-inside ml-6 mt-1 space-y-1">
                          <li>Emails & chats from a predefined VIP list.</li>
                          <li>Time-sensitive approval requests (e.g., DocuSign, MemoApp).</li>
                          <li>Emails where the user is the sole recipient in the 'To:' field.</li>
                      </ul>
                  </li>
                  <li><strong>Calendar Insights:</strong> Highlighting key meetings for the day.</li>
                  <li><strong>File Awareness:</strong> Answering questions about recently modified documents.</li>
              </ul>
            </li>
            <li>
              <strong>Drafting Assistance:</strong> Users can ask HER to compose replies to emails or messages. The generated text is presented for user review and approval before sending.
            </li>
            <li>
              <strong>PWA Foundation:</strong> The application is built as a PWA, ensuring it's accessible across devices from a web browser without needing an app store installation.
            </li>
            <li>
              <strong>Dark Theme & Gen Z Aesthetics:</strong> The UI will be exclusively a dark theme, utilizing modern fonts, vibrant gradients, and subtle animations to create an engaging and visually pleasing experience.
            </li>
          </ul>
        </Section>
        
        <Section title="4. Future Phases (Post-MVP)">
           <ul className="list-disc list-inside space-y-2">
             <li>
              <strong>Third-Party Integrations:</strong> Expand connectivity to include WhatsApp and Viber for a more comprehensive communication hub.
            </li>
            <li>
              <strong>Automated Calling:</strong> Integrate with a telephony API to allow HER to place phone calls on the user's behalf for urgent matters, such as confirming appointments or following up on critical tasks.
            </li>
             <li>
              <strong>On-device Personalization:</strong> Develop features to learn a user's specific priorities, communication style, and preferences over time.
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section>
    <h3 className="text-xl font-semibold mb-3 text-purple-400">{title}</h3>
    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-li:text-gray-300">
        {children}
    </div>
  </section>
);


export default PRDDisplay;
