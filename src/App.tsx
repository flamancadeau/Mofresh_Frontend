import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import { ThemeProvider } from './components/ui/ThemeProvider';
import AppRoutes from './routes/AppRoutes';
import { MoFreshAssistant } from './components/MoFreshAssistant';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { useLocation } from 'react-router';

export default function App() {
  const location = useLocation();
  const isContactPage = location.pathname === '/contact';

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
          {isContactPage && <WhatsAppButton />}
          <MoFreshAssistant />
          <AppRoutes />
        </div>
      </ThemeProvider>
    </I18nextProvider>
  );
}