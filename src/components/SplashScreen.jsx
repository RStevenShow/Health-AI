import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Esperar 2.5 segundos y luego desvanecer
    const timer = setTimeout(() => {
      setFade(true);
      // Esperar a que termine la animación de desvanecimiento para desmontar
      setTimeout(onFinish, 500); 
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Animación del Logo */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
        <div className="relative bg-white p-1 rounded-full shadow-2xl overflow-hidden w-full h-full flex items-center justify-center border-4 border-indigo-400/30">
           {/* Asegúrate de tener logo.jpg en public */}
           <img src="../IMG/icon.png" alt="Logo" className="w-full h-full object-cover rounded-full animate-pulse" />
        </div>
      </div>

      {/* Texto Animado */}
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold text-white tracking-tight animate-fade-in-up">
          Health-<span className="text-indigo-400">AI</span>
        </h1>
        <p className="text-indigo-200 text-sm uppercase tracking-[0.3em] animate-fade-in-up delay-100">
          Tu mente importa
        </p>
      </div>

      {/* Loader Sutil */}
      <div className="absolute bottom-10 w-16 h-1 bg-indigo-900 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-400 w-1/2 animate-loading-bar rounded-full"></div>
      </div>
    </div>
  );
};

export default SplashScreen;