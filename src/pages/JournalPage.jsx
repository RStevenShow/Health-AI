import React, { useState, useEffect } from 'react';
import { ArrowLeft, PenTool, Plus, BookHeart, Sparkles, Calendar } from 'lucide-react';
import { db, auth } from '../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { analyzeJournalEntry } from '../services/ai';
import Button from '../components/ui/Button';

const JournalPage = ({ onBack }) => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Leer el diario en tiempo real
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'journal'), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(docs);
    });

    return () => unsubscribe();
  }, []);

  // 2. Guardar y Analizar
  const handleSave = async () => {
    if (!newEntry.trim()) return;
    setLoading(true);

    try {
      // Pedimos a la IA que analice el texto
      const analysisRaw = await analyzeJournalEntry(newEntry);
      
      // Parseamos la respuesta (un poco de magia para separar emoción de reflexión)
      let emotion = "Reflexivo";
      let reflection = "Sigue escribiendo para conocerte mejor.";
      
      const lines = analysisRaw.split('\n');
      lines.forEach(line => {
        if (line.startsWith("Emoción:")) emotion = line.replace("Emoción:", "").trim();
        if (line.startsWith("Reflexión:")) reflection = line.replace("Reflexión:", "").trim();
      });

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'journal'), {
        text: newEntry,
        emotion: emotion,
        reflection: reflection,
        createdAt: serverTimestamp(),
        dateString: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      });

      setNewEntry("");
      setIsWriting(false);

    } catch (error) {
      console.error("Error guardando diario:", error);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 bg-[#F8FAFC] min-h-screen relative">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
          <ArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Diario Inteligente</h1>
          <p className="text-gray-500 text-sm">Tus pensamientos, enriquecidos por la IA.</p>
        </div>
      </div>

      {/* Área de Escritura (Modal o Expandible) */}
      {isWriting ? (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-indigo-100 mb-8 animate-fade-in">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
             <PenTool size={20} className="text-indigo-600"/> Nuevo Registro
          </h3>
          <textarea
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none h-40 resize-none text-gray-700 leading-relaxed"
            placeholder="¿Qué tienes en mente hoy? Desahógate..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setIsWriting(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl">Cancelar</button>
            <Button onClick={handleSave} disabled={loading} icon={Sparkles}>
               {loading ? "Analizando..." : "Guardar y Analizar"}
            </Button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsWriting(true)}
          className="w-full py-4 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl text-indigo-600 font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all mb-8"
        >
          <Plus size={24} /> Escribir sobre mi día
        </button>
      )}

      {/* Lista de Entradas */}
      <div className="space-y-6 pb-24">
        {entries.length === 0 && !isWriting && (
           <div className="text-center py-12 text-gray-400">
              <BookHeart size={48} className="mx-auto mb-3 opacity-50" />
              <p>Aún no has escrito nada. ¡Empieza hoy!</p>
           </div>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3">
               <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <Calendar size={14} /> {entry.dateString}
               </div>
               <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                  {entry.emotion}
               </span>
            </div>
            
            <p className="text-gray-700 mb-6 whitespace-pre-wrap leading-relaxed">{entry.text}</p>

            {/* La joya de la corona: La respuesta de la IA */}
            {entry.reflection && (
               <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                  <Sparkles size={20} className="text-amber-500 shrink-0 mt-1" />
                  <div>
                     <p className="text-amber-900 text-sm italic font-medium">
                        "{entry.reflection}"
                     </p>
                  </div>
               </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default JournalPage;
