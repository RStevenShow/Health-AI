import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { Loader2, MessageCircle, ClipboardList, BarChart2 } from 'lucide-react';

// Páginas
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage'; // Ahora será el Dashboard
import ChatPage from './pages/ChatPage';
import AssessmentPage from './pages/AssessmentPage';
import StatsPage from './pages/StatsPage';
import AboutPage from './pages/AboutPage';
import BreathingPage from './pages/BreathingPage';
import JournalPage from './pages/JournalPage';
import MaintenancePage from './pages/MaintenancePage';

// --- INTERRUPTOR  ---
// Pon esto en 'true' para bloquear la app. 
// Pon esto en 'false' el día de la presentación.
const IS_MAINTENANCE_MODE = true; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('profile');

  // 1. BLOQUEO DE EMERGENCIA (Lo primero que se verifica)
  if (IS_MAINTENANCE_MODE) {
     return <MaintenancePage />;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="antialiased relative min-h-screen bg-[#F8FAFC]">
      
      {/* VISTA 1: DASHBOARD (Antes Perfil) */}
      {/* Le pasamos la función de navegación para que los botones del dashboard funcionen */}
      {currentView === 'profile' && (
        <ProfilePage onNavigate={setCurrentView} />
      )}

      {/* VISTA 2: CHATBOT */}
      {currentView === 'chat' && (
        <ChatPage onBack={() => setCurrentView('profile')} />
      )}

      {/* VISTA 3: EVALUACIÓN */}
      {currentView === 'assessment' && (
        <AssessmentPage onBack={() => setCurrentView('profile')} />
      )}

      {/* VISTA 4: ESTADÍSTICAS */}
      {currentView === 'stats' && (
        <StatsPage onBack={() => setCurrentView('profile')} />
      )}

      {/* VISTA 5: ACERCA DE */}
      {currentView === 'about' && (
        <AboutPage onBack={() => setCurrentView('profile')} />
      )}

      {/* VISTA 6: RESPIRACIÓN */}
      {currentView === 'breathing' && (
        <BreathingPage onBack={() => setCurrentView('profile')} />
      )}

      {/* VISTA 7: DIARIO */}
      {currentView === 'journal' && (
        <JournalPage onBack={() => setCurrentView('profile')} />
      )}
    </div>
  );
}

export default App;