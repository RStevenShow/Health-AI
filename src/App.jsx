import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { Loader2 } from 'lucide-react';

// Páginas
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import AssessmentPage from './pages/AssessmentPage';
import StatsPage from './pages/StatsPage';
import AboutPage from './pages/AboutPage';
import BreathingPage from './pages/BreathingPage';
import JournalPage from './pages/JournalPage';
import MaintenancePage from './pages/MaintenancePage';
import SplashScreen from './components/SplashScreen';

// --- INTERRUPTOR ---
const IS_MAINTENANCE_MODE = true ; // Cambia a 'false' para desactivar el modo mantenimiento

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga de Firebase
  const [showSplash, setShowSplash] = useState(true); // Estado para el SplashScreen
  const [currentView, setCurrentView] = useState('profile');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Firebase ha terminado de cargar
    });
    return () => unsubscribe();
  }, []);

  // 1. MODO MANTENIMIENTO (Prioridad Alta)
  if (IS_MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }

  // 2. SPLASH SCREEN (Se muestra mientras carga Firebase o si showSplash es true)
  // Esto evita el parpadeo blanco mientras Firebase verifica la sesión
  if (showSplash || loading) {
    return (
      <SplashScreen 
        onFinish={() => setShowSplash(false)} 
      />
    );
  }

  // 3. SI NO HAY USUARIO -> LOGIN
  if (!user) {
    return <AuthPage />;
  }

  // 4. SI HAY USUARIO -> APP PRINCIPAL
  return (
    <div className="antialiased relative min-h-screen bg-[#F8FAFC]">
      
      {currentView === 'profile' && (
        <ProfilePage onNavigate={setCurrentView} />
      )}

      {currentView === 'chat' && (
        <ChatPage onBack={() => setCurrentView('profile')} />
      )}

      {currentView === 'assessment' && (
        <AssessmentPage onBack={() => setCurrentView('profile')} />
      )}

      {currentView === 'stats' && (
        <StatsPage onBack={() => setCurrentView('profile')} />
      )}

      {currentView === 'about' && (
        <AboutPage onBack={() => setCurrentView('profile')} />
      )}

      {currentView === 'breathing' && (
        <BreathingPage onBack={() => setCurrentView('profile')} />
      )}

      {currentView === 'journal' && (
        <JournalPage onBack={() => setCurrentView('profile')} />
      )}
      
    </div>
  );
}

export default App;