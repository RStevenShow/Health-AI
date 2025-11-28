import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wind, Play, Pause } from 'lucide-react';

const BreathingPage = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [text, setText] = useState("Listo para comenzar");
  const [phase, setPhase] = useState("hold"); // in, hold, out

  useEffect(() => {
    let interval = null;
    if (isActive) {
      // Ciclo de respiración 4-7-8 (Técnica relajante)
      const breatheLoop = () => {
        setPhase("in");
        setText("Inhala profundamente...");
        setTimeout(() => {
          setPhase("hold");
          setText("Mantén el aire...");
          setTimeout(() => {
            setPhase("out");
            setText("Exhala suavemente...");
          }, 4000); // Mantener 4s (ajustado para demo)
        }, 4000); // Inhalar 4s
      };

      breatheLoop();
      interval = setInterval(breatheLoop, 12000); // Ciclo total 12s
    } else {
      setText("Listo para comenzar");
      setPhase("idle");
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Botón Volver */}
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 p-3 bg-white/50 backdrop-blur-md rounded-full hover:bg-white transition-all z-20"
      >
        <ArrowLeft className="text-indigo-800" />
      </button>

      <h1 className="text-3xl font-bold text-indigo-900 mb-2 z-10">Respiración Guiada</h1>
      <p className="text-indigo-600 mb-12 z-10 text-center max-w-md">
        Sigue el ritmo del círculo para calmar tu mente y reducir la ansiedad en segundos.
      </p>

      {/* Círculo Animado */}
      <div className="relative flex items-center justify-center mb-16">
        {/* Círculos de fondo (Efecto onda) */}
        <div className={`absolute w-64 h-64 bg-indigo-300 rounded-full opacity-20 transition-all duration-[4000ms] ease-in-out ${phase === 'in' ? 'scale-150' : phase === 'out' ? 'scale-100' : 'scale-125'}`}></div>
        <div className={`absolute w-48 h-48 bg-indigo-400 rounded-full opacity-30 transition-all duration-[4000ms] ease-in-out delay-75 ${phase === 'in' ? 'scale-150' : phase === 'out' ? 'scale-100' : 'scale-125'}`}></div>
        
        {/* Círculo Principal */}
        <div className={`relative w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-[4000ms] ease-in-out z-10 ${phase === 'in' ? 'scale-125 bg-indigo-50' : phase === 'out' ? 'scale-90 bg-blue-50' : 'scale-100'}`}>
           <Wind size={48} className={`text-indigo-500 transition-opacity duration-1000 ${phase === 'hold' ? 'opacity-100' : 'opacity-50'}`} />
        </div>
      </div>

      {/* Instrucción Texto */}
      <div className="h-12 mb-8 z-10">
         <p className="text-2xl font-medium text-indigo-800 animate-pulse text-center">
            {text}
         </p>
      </div>

      {/* Control */}
      <button
        onClick={() => setIsActive(!isActive)}
        className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 shadow-lg transition-all transform hover:scale-105 active:scale-95 z-10 ${
          isActive 
            ? "bg-white text-indigo-600 border-2 border-indigo-100" 
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {isActive ? <><Pause fill="currentColor" /> Pausar</> : <><Play fill="currentColor" /> Iniciar</>}
      </button>

      {/* Decoración fondo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
         <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

    </div>
  );
};

export default BreathingPage;