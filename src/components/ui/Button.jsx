import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  type = 'button', 
  disabled = false, 
  icon: Icon 
}) => {
  // Estilos base: redondeado, padding, transición suave
  const baseStyle = "px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed";
  
  // Variantes de color (Tema: Salud Mental - Colores Calmos)
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 border border-transparent",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    ghost: "text-gray-600 hover:bg-gray-100 bg-transparent",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent"
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={disabled}
    >
      {/* Si 'disabled' es true, asumimos que puede estar cargando */}
      {disabled && <Loader2 className="animate-spin w-4 h-4" />}
      
      {/* Si hay un icono y NO está cargando, lo mostramos */}
      {!disabled && Icon && <Icon size={18} />}
      
      {children}
    </button>
  );
};

export default Button;