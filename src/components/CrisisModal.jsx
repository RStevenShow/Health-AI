import React from 'react';
import { Phone, X, AlertCircle, ExternalLink } from 'lucide-react';

const CrisisModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
        
        {/* Cabecera Roja */}
        <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-4">
           <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <AlertCircle size={32} />
           </div>
           <div>
              <h2 className="text-xl font-bold text-gray-800">Ayuda Inmediata</h2>
              <p className="text-red-600 text-sm font-medium">No estás solo/a en esto.</p>
           </div>
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-gray-500">
              <X size={20} />
           </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
           <p className="text-gray-600 text-sm leading-relaxed">
              Si sientes que estás en peligro o tienes pensamientos de hacerte daño, por favor contacta a servicios de emergencia o habla con alguien ahora mismo.
           </p>

           <div className="space-y-3">
              {/* Botón de Emergencia Nacional */}
              <a 
                href="tel:112" // Cambia esto según el número de tu país (911, 112, etc)
                className="flex items-center justify-between p-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md group"
              >
                 <div className="flex items-center gap-3">
                    <Phone size={20} className="fill-current" />
                    <span className="font-bold">Emergencias (112/911)</span>
                 </div>
                 <ExternalLink size={18} className="opacity-50 group-hover:opacity-100" />
              </a>

              {/* Teléfono de la Esperanza (Ejemplo España/Latam) */}
              <a 
                href="tel:717003717" 
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 text-gray-700 rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition-all"
              >
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Teléfono de la Esperanza</span>
                 </div>
                 <span className="text-sm font-bold">Llamar</span>
              </a>
           </div>
        </div>

        {/* Pie */}
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
           Health-AI • Recursos de Crisis
        </div>
      </div>
    </div>
  );
};

export default CrisisModal;