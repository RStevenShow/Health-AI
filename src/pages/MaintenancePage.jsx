import React from 'react';
import { Lock, CalendarClock } from 'lucide-react'; // Quitamos BrainCircuit

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center p-6 text-white text-center">
      <div className="max-w-lg w-full space-y-8 animate-fade-in">
        
        {/* CONTENEDOR DEL LOGO */}
        <div className="relative w-40 h-40 mx-auto">
          {/* Efecto de onda (ping) */}
          <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
          
          {/* Círculo principal con borde */}
          <div className="relative bg-white w-full h-full rounded-full flex items-center justify-center shadow-2xl border-4 border-indigo-400/50 overflow-hidden p-1">
             {/* TU LOGO AQUÍ */}
             {/* Asegúrate de que el archivo 'logo.jpg' esté en la carpeta 'public' */}
             <img 
               src="../IMG/icon.png" 
               alt="Health-AI Logo" 
               className="w-full h-full object-cover rounded-full"
             />
          </div>
        </div>

        <div className="space-y-4">
           <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
             Health-<span className="text-indigo-400">AI</span>
           </h1>
           <p className="text-xl text-indigo-200 font-light">
             Estamos preparando algo increíble para ti.
           </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl">
           <div className="flex items-center justify-center gap-3 text-yellow-400 mb-4">
              <CalendarClock size={24} />
              <span className="font-bold uppercase tracking-widest text-sm">Lanzamiento Oficial</span>
           </div>
           <h2 className="text-2xl font-medium text-white mb-2">
             Próximamente
           </h2>
           <p className="text-sm text-gray-400">
              Nuestra plataforma de inteligencia artificial para la salud mental estará disponible muy pronto.
           </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 opacity-60">
           <Lock size={12} />
           <span>Sitio protegido • Acceso restringido</span>
        </div>

      </div>
    </div>
  );
};

export default MaintenancePage;