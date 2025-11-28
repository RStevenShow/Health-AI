import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { ArrowLeft, Activity, Loader2, BrainCircuit, Frown, Zap, Flame } from 'lucide-react';
import { auth, db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const StatsPage = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ 
    total: 0, 
    lastDepression: 0, 
    lastAnxiety: 0, 
    lastStress: 0,
    lastAnalysis: null 
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      try {
        const ref = collection(db, 'users', auth.currentUser.uid, 'assessments');
        const q = query(ref, orderBy('createdAt', 'asc'));
        const snapshot = await getDocs(q);

        const formattedData = snapshot.docs.map(doc => {
          const d = doc.data();
          const dateObj = d.createdAt ? d.createdAt.toDate() : new Date();
          
          // Lógica de compatibilidad:
          // Si el registro es nuevo tiene 'scores' {depresion, ansiedad...}
          // Si es viejo solo tiene 'score' (que era depresión)
          const depresion = d.scores?.depresion !== undefined ? d.scores.depresion : (d.score || 0);
          const ansiedad = d.scores?.ansiedad || 0;
          const estres = d.scores?.estres || 0;

          return {
            date: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
            fullDate: dateObj.toLocaleDateString(),
            depresion: depresion,
            ansiedad: ansiedad,
            estres: estres,
            analysis: d.ai_analysis
          };
        });

        setData(formattedData);

        if (formattedData.length > 0) {
          const lastItem = formattedData[formattedData.length - 1];
          
          setSummary({
            total: formattedData.length,
            lastDepression: lastItem.depresion,
            lastAnxiety: lastItem.ansiedad,
            lastStress: lastItem.estres,
            lastAnalysis: lastItem.analysis
          });
        }

      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 bg-[#F8FAFC] min-h-screen animate-fade-in">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
          <ArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mi Evolución</h1>
          <p className="text-gray-500 text-sm">Historial de tus niveles emocionales.</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">Aún no hay datos</h3>
          <p className="text-gray-500 mt-2">Realiza tu primera evaluación completa para ver tus estadísticas.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* --- TARJETAS DE ÚLTIMO ESTADO --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Depresión */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Frown size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Depresión</p>
                <p className="text-2xl font-bold text-gray-800">
                  {summary.lastDepression} <span className="text-sm text-gray-400 font-normal">/ 27</span>
                </p>
              </div>
            </div>

            {/* Ansiedad */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Ansiedad</p>
                <p className="text-2xl font-bold text-gray-800">
                  {summary.lastAnxiety} <span className="text-sm text-gray-400 font-normal">/ 21</span>
                </p>
              </div>
            </div>

            {/* Estrés */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Estrés</p>
                <p className="text-2xl font-bold text-gray-800">
                  {summary.lastStress} <span className="text-sm text-gray-400 font-normal">/ 18</span>
                </p>
              </div>
            </div>

          </div>

          {/* --- GRÁFICA DE EVOLUCIÓN MULTILÍNEA --- */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-96">
            <h3 className="font-bold text-gray-800 mb-6 text-lg">Tendencia Histórica</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                
                {/* Línea Depresión (Azul) */}
                <Line 
                  name="Depresión"
                  type="monotone" 
                  dataKey="depresion" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                
                {/* Línea Ansiedad (Ámbar) */}
                <Line 
                  name="Ansiedad"
                  type="monotone" 
                  dataKey="ansiedad" 
                  stroke="#D97706" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#D97706", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />

                {/* Línea Estrés (Rojo) */}
                <Line 
                  name="Estrés"
                  type="monotone" 
                  dataKey="estres" 
                  stroke="#DC2626" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#DC2626", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* --- ÚLTIMA OPINIÓN DE IA --- */}
          {summary.lastAnalysis && (
             <div className="bg-indigo-600 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                {/* Elemento decorativo */}
                <div className="absolute -top-6 -right-6 opacity-10">
                   <BrainCircuit size={150} />
                </div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                   <div className="p-2 bg-indigo-500/50 rounded-lg backdrop-blur-sm">
                     <BrainCircuit size={24} className="text-white" />
                   </div>
                   <h3 className="font-bold text-indigo-50 text-lg">Análisis Clínico Reciente</h3>
                </div>
                
                <p className="text-white/95 text-base md:text-lg leading-relaxed italic font-light relative z-10">
                   "{summary.lastAnalysis}"
                </p>
             </div>
          )}

        </div>
      )}
    </div>
  );
};

export default StatsPage;