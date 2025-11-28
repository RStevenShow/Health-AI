import React from 'react';
import { ArrowLeft, FileText, Download, ExternalLink, ShieldCheck, BookOpen } from 'lucide-react';

const AboutPage = ({ onBack }) => {
  
  // Lista de documentos utilizados (Base de Conocimiento)
  const resources = [
    {
      title: "Manual de Recursos de la OMS sobre Salud Mental",
      author: "Organización Mundial de la Salud (OMS)",
      description: "Marco ético, legal y de derechos humanos para la atención en salud mental. Define los estándares internacionales de protección al paciente.",
      // Nota: Estos archivos deben estar en la carpeta 'public' de tu proyecto para que funcionen las descargas
      link: "/ManualrecursosOMSSaludMental.pdf", 
      type: "PDF Oficial"
    },
    {
      title: "Guía de Trastornos Mentales",
      author: "Instituto Nacional de Neuroeducación",
      description: "Descripción clínica detallada de sintomatología, tipos de trastornos (ansiedad, depresión, personalidad) y criterios diagnósticos.",
      link: "/documento-965-434272.pdf",
      type: "Documento Clínico"
    },
    {
      title: "Guías de Autoayuda: Depresión y Ansiedad",
      author: "Servicio Andaluz de Salud",
      description: "Estrategias prácticas cognitivo-conductuales, ejercicios de relajación y consejos para el manejo de síntomas en la vida diaria.",
      link: "/Guiasautoayudadepresionansiedad.pdf",
      type: "Guía Práctica"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#F8FAFC] min-h-screen animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
          <ArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Acerca de Health-AI</h1>
          <p className="text-gray-500 text-sm">Transparencia, Ética y Fuentes Científicas</p>
        </div>
      </div>

      {/* Tarjeta de Introducción */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
           <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
              <ShieldCheck size={40} />
           </div>
           <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Nuestro Compromiso de Calidad</h2>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                 Health-AI no es un médico, pero ha sido entrenado para actuar con la máxima responsabilidad. 
                 Nuestro sistema de Inteligencia Artificial utiliza una técnica llamada <strong>RAG (Retrieval-Augmented Generation)</strong>.
                 Esto significa que la IA no "inventa" respuestas, sino que consulta una biblioteca de documentos clínicos verificados antes de contestar a tus preguntas.
              </p>
              <div className="flex flex-wrap gap-2">
                 <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">Evidencia Científica</span>
                 <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">Privacidad de Datos</span>
                 <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">Enfoque Ético</span>
              </div>
           </div>
        </div>
      </div>

      {/* Sección de Bibliografía */}
      <h3 className="text-gray-800 font-bold mb-6 flex items-center gap-2 text-lg ml-2">
         <BookOpen size={24} className="text-indigo-600" /> Biblioteca de Conocimiento
      </h3>

      <div className="grid gap-6">
        {resources.map((res, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group relative overflow-hidden">
             {/* Etiqueta de tipo */}
             <div className="absolute top-0 right-0 bg-gray-50 px-4 py-2 rounded-bl-2xl border-b border-l border-gray-100 text-xs font-bold text-gray-500">
                {res.type}
             </div>

             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4 mt-2">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                   <FileText size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-gray-800 text-lg leading-tight">{res.title}</h4>
                   <p className="text-indigo-600 text-sm font-medium">{res.author}</p>
                </div>
             </div>
             
             <p className="text-gray-500 text-sm mb-6 leading-relaxed border-l-2 border-gray-100 pl-4">
                {res.description}
             </p>

             <div className="flex gap-3">
               <a 
                 href={res.link} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
               >
                  <ExternalLink size={16} /> Ver Documento
               </a>
               <a 
                 href={res.link} 
                 download
                 className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
               >
                  <Download size={16} /> Descargar
               </a>
             </div>
          </div>
        ))}
      </div>

      {/* Footer Legal */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-400 text-xs space-y-2">
         <p>Health-AI v1.0 • Desarrollado con fines de apoyo emocional.</p>
         <p>Este sistema no sustituye el consejo, diagnóstico o tratamiento médico profesional. En caso de emergencia, contacte a los servicios de salud locales.</p>
      </div>

    </div>
  );
};

export default AboutPage;