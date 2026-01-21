import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import './styles/centering-fix.css';
import './styles/force-center.css';
import './styles/EMERGENCY-CENTER-FIX.css';
import './styles/ULTIMATE-CENTER-FIX.css';
import './styles/FIX-ACCESO-RAPIDO.css';
import './styles/FIX-CONTACTO.css';
import './styles/FIX-NOTICIAS-HOME.css';
import './styles/FIX-GRUPOS-INTERES.css';
import './styles/FIX-GRUPOS-GRID-LEFT.css';
import './styles/FIX-UBICACION.css';
import './styles/FIX-ESTADISTICAS-SECTION.css';
import './styles/FIX-GACETA.css';
import './styles/FIX-ENLACES-INTERES.css';
import './styles/FIX-ENLACES-GRID-SCROLL.css';
import './styles/ENHANCED-DESIGN.css';
import './styles/FIX-WHITE-OVERLAY.css';
import './styles/FIX-HORIZONTAL-SCROLL.css';
import './styles/FIX-RESPONSIVE-CONTACTO.css';
import './styles/RESPONSIVE-IMPROVEMENTS.css';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Deshabilitado StrictMode temporalmente para debug del parpadeo
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <LanguageProvider>
          <ThemeProvider>
            <AccessibilityProvider>
              <AuthProvider>
                <ToastProvider>
                  <App />
                </ToastProvider>
              </AuthProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  // </React.StrictMode>
);


















