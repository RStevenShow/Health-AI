import React, { useState } from 'react';
import { 
  Activity, CheckCircle, AlertTriangle, Save, ArrowLeft, BrainCircuit, 
  TrendingUp, Frown, Zap 
} from 'lucide-react';
import Button from '../components/ui/Button';
import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { analyzeAssessment } from '../services/ai';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// --- CUESTIONARIO CLÍNICO COMPLETO ---
const questions = [
  // === PHQ-9: DEPRESIÓN ===
  { id: 1, text: "Poco interés o placer en hacer cosas", category: 'depresion' },
  { id: 2, text: "Se ha sentido decaído/a, deprimido/a o sin esperanza", category: 'depresion' },
  { id: 3, text: "Dificultad para dormirse o permanecer dormido/a, o ha dormido demasiado", category: 'depresion' },
  { id: 4, text: "Se ha sentido cansado/a o con poca energía", category: 'depresion' },
  { id: 5, text: "Sin apetito o ha comido en exceso", category: 'depresion' },
  { id: 6, text: "Se ha sentido mal con usted mismo/a (o que es un fracaso o que ha decepcionado a su familia)", category: 'depresion' },
  { id: 7, text: "Dificultad para concentrarse en cosas, tales como leer el periódico o ver televisión", category: 'depresion' },
  { id: 8, text: "Se ha movido o hablado tan lento que los demás lo han notado (o lo contrario, muy inquieto)", category: 'depresion' },
  { id: 9, text: "Pensamientos de que estaría mejor muerto/a o de lastimarse de alguna manera", category: 'depresion' },

  // === GAD-7: ANSIEDAD ===
  { id: 10, text: "Se ha sentido nervioso/a, ansioso/a o con los nervios de punta", category: 'ansiedad' },
  { id: 11, text: "No ha sido capaz de parar o controlar sus preocupaciones", category: 'ansiedad' },
  { id: 12, text: "Se ha preocupado demasiado por motivos diferentes", category: 'ansiedad' },
  { id: 13, text: "Ha tenido dificultad para relajarse", category: 'ansiedad' },
  { id: 14, text: "Se ha sentido tan inquieto/a que no podía quedarse quieto/a", category: 'ansiedad' },
  { id: 15, text: "Se ha molestado o irritado fácilmente", category: 'ansiedad' },
  { id: 16, text: "Ha sentido miedo como si algo terrible fuera a pasar", category: 'ansiedad' },

  // === ESCALA DE ESTRÉS (Items negativos) ===
  { id: 17, text: "Se ha sentido molesto/a por algo que ocurrió inesperadamente", category: 'estres' },
  { id: 18, text: "Ha sentido que las cosas importantes de su vida estaban fuera de su control", category: 'estres' },
  { id: 19, text: "Se ha sentido nervioso/a o estresado/a", category: 'estres' },
  { id: 20, text: "Ha sentido que no podía afrontar todas las cosas que tenía que hacer", category: 'estres' },
  { id: 21, text: "Se ha enfadado porque las cosas que le han ocurrido estaban fuera de su control", category: 'estres' },
  { id: 22, text: "Ha sentido que las dificultades se acumulaban tanto que no podía superarlas", category: 'estres' }
];

const options = [
  { label: "Nunca", value: 0 },
  { label: "Varios días", value: 1 },
  { label: "Más de la mitad", value: 2 },
  { label: "Casi todos los días", value: 3 }
];

// Títulos y configuraciones para cada sección
const SECTIONS = {
  depresion: { title: "Cuestionario PHQ-9 (Depresión)", icon: Frown, color: "text-blue-600", maxScore: 27 },
  ansiedad: { title: "Escala GAD-7 (Ansiedad)", icon: Zap, color: "text-amber-600", maxScore: 21 },
  estres: { title: "Nivel de Estrés Percibido", icon: Activity, color: "text-red-600", maxScore: 18 }
};

const AssessmentPage = ({ onBack }) => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");

  const handleSelect = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateResult = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert(`Por favor responde todas las preguntas (${Object.keys(answers).length}/${questions.length}) para un resultado preciso.`);
      return;
    }

    setLoading(true);
    
    let scores = { depresion: 0, ansiedad: 0, estres: 0 };
    questions.forEach(q => {
        scores[q.category] += (answers[q.id] || 0);
    });

    let mainIssue = "Equilibrado";
    if (scores.depresion >= 10) mainIssue = "Predominio Depresivo";
    if (scores.ansiedad >= 10 && scores.ansiedad > scores.depresion) mainIssue = "Predominio Ansioso";
    if (scores.estres >= 10 && scores.estres > scores.ansiedad) mainIssue = "Alto Estrés";
    if (scores.depresion < 5 && scores.ansiedad < 5 && scores.estres < 5) mainIssue = "Saludable";

    const totalScore = scores.depresion + scores.ansiedad + scores.estres;

    const graphData = [
        { subject: 'Depresión', A: (scores.depresion / SECTIONS.depresion.maxScore) * 100, fullMark: 100 },
        { subject: 'Ansiedad', A: (scores.ansiedad / SECTIONS.ansiedad.maxScore) * 100, fullMark: 100 },
        { subject: 'Estrés', A: (scores.estres / SECTIONS.estres.maxScore) * 100, fullMark: 100 },
    ];

    try {
      const clinicalContext = `
        RESULTADOS TEST MULTIDIMENSIONAL:
        - PHQ-9 (Depresión): ${scores.depresion}/${SECTIONS.depresion.maxScore}
        - GAD-7 (Ansiedad): ${scores.ansiedad}/${SECTIONS.ansiedad.maxScore}
        - Estrés Percibido: ${scores.estres}/${SECTIONS.estres.maxScore}
        Instrucción: Actúa como psicólogo clínico. Analiza estos resultados. 
        Explica qué significan estos números combinados y da una recomendación breve y cálida.
      `;
      
      const analysis = await analyzeAssessment(questions, answers, clinicalContext);
      setAiAnalysis(analysis);

      const assessmentData = {
        date: new Date().toLocaleDateString(),
        scores: scores, 
        totalScore: totalScore, 
        interpretation: mainIssue, 
        ai_analysis: analysis,
        answers: answers,
        createdAt: serverTimestamp()
      };

      if (auth.currentUser) {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'assessments'), {
            ...assessmentData,
            score: totalScore 
        });
      }
      setResult({ ...assessmentData, graphData });

    } catch (error) {
      console.error("Error:", error);
      setResult({ scores, interpretation: mainIssue, graphData });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-fade-in bg-[#F8FAFC] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center w-full my-10">
          
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfil Clínico</h2>
          <p className="text-gray-500 mb-6">Tendencia: <span className="font-bold text-indigo-600">{result.interpretation}</span></p>

          <div className="h-64 w-full mb-6 relative">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={result.graphData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    name="Intensidad %"
                    dataKey="A"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    fill="#4F46E5"
                    fillOpacity={0.5}
                  />
                </RadarChart>
             </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-600 font-bold">Depresión</p>
              <p className="text-xl font-bold text-blue-800">{result.scores.depresion}<span className="text-xs text-blue-400">/27</span></p>
            </div>
            <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-600 font-bold">Ansiedad</p>
              <p className="text-xl font-bold text-amber-800">{result.scores.ansiedad}<span className="text-xs text-amber-400">/21</span></p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg border border-red-100">
              <p className="text-xs text-red-600 font-bold">Estrés</p>
              <p className="text-xl font-bold text-red-800">{result.scores.estres}<span className="text-xs text-red-400">/18</span></p>
            </div>
          </div>

          {aiAnalysis && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
               <div className="absolute -right-4 -top-4 opacity-10">
                  <BrainCircuit size={100} className="text-indigo-600" />
               </div>
               <div className="flex items-center gap-2 mb-3">
                  <BrainCircuit size={20} className="text-indigo-600" />
                  <h3 className="font-bold text-indigo-900">Opinión de Health-AI</h3>
               </div>
               <p className="text-indigo-800 text-sm leading-relaxed italic">
                  "{aiAnalysis}"
               </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button variant="secondary" onClick={onBack}>Volver al Menú</Button>
            <Button onClick={() => { setResult(null); setAnswers({}); setAiAnalysis(""); }}>Hacer otro test</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 bg-[#F8FAFC] min-h-screen relative">
      
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-sm z-20 py-4 border-b border-gray-200/50">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
          <ArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Evaluación Clínica</h1>
          <p className="text-gray-500 text-xs md:text-sm">Responde honestamente pensando en los últimos 15 días.</p>
        </div>
      </div>

      <div className="space-y-10">
        {['depresion', 'ansiedad', 'estres'].map((cat) => {
           const sectionInfo = SECTIONS[cat];
           const sectionQuestions = questions.filter(q => q.category === cat);
           
           return (
             <div key={cat} className="animate-fade-in">
                <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 border-gray-100 ${sectionInfo.color}`}>
                   <sectionInfo.icon size={28} />
                   <h3 className="text-xl md:text-2xl font-bold">{sectionInfo.title}</h3>
                </div>
                
                <div className="space-y-6"> {/* Más espacio entre preguntas */}
                   {sectionQuestions.map((q) => (
                      <QuestionCard key={q.id} q={q} answers={answers} handleSelect={handleSelect} />
                   ))}
                </div>
             </div>
           );
        })}
      </div>

      {/* Espaciador extra grande para el scroll */}
      <div className="h-64 w-full"></div>

      {/* BARRA FLOTANTE */}
      <div className="fixed bottom-0 left-0 w-full p-4 md:p-6 z-30 pointer-events-none">
         <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transform transition-all hover:scale-[1.01]">
              
              <div className="w-full sm:w-auto flex items-center gap-3">
                 <div className="relative w-full sm:w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                       className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-500"
                       style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                    ></div>
                 </div>
                 <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
                    <span className="text-indigo-600 font-bold">{Object.keys(answers).length}</span> / {questions.length}
                 </div>
              </div>

              <Button 
                onClick={calculateResult} 
                disabled={loading || Object.keys(answers).length < questions.length}
                icon={loading ? BrainCircuit : Save}
                className="w-full sm:w-auto px-8 py-4 text-lg shadow-lg shadow-indigo-200"
              >
                {loading ? 'Analizando...' : 'Obtener Diagnóstico'}
              </Button>
            </div>
         </div>
      </div>
    </div>
  );
};

// COMPONENTE DE TARJETA DE PREGUNTA MEJORADO (Agrandado)
const QuestionCard = ({ q, answers, handleSelect }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-lg hover:border-indigo-50">
    {/* Texto de pregunta más grande y legible */}
    <p className="font-bold text-gray-800 mb-6 text-lg md:text-xl leading-relaxed">
      {q.text}
    </p>
    
    {/* Botones más grandes y fáciles de tocar */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleSelect(q.id, opt.value)}
          className={`py-4 px-3 rounded-2xl text-sm md:text-base font-semibold transition-all border-2 ${
            answers[q.id] === opt.value
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]'
              : 'bg-white text-gray-500 border-gray-100 hover:bg-indigo-50 hover:border-indigo-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default AssessmentPage;