import React from 'react';

const InputField = ({ label, type, value, onChange, placeholder, disabled, icon: Icon }) => (
  <div className="space-y-1.5 mb-4">
    {/* La etiqueta (Label) */}
    <label className="text-sm font-semibold text-gray-700 ml-1">
      {label}
    </label>
    
    <div className="relative">
      {/* El Input real */}
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        // Clases de Tailwind para el borde, foco azul, redondeado
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400"
      />
      
      {/* Si pasamos un icono, lo colocamos flotando a la izquierda */}
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
      )}
    </div>
  </div>
);

export default InputField;