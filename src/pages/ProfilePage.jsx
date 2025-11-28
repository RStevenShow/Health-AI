import React, { useState, useEffect } from 'react';
import { 
  User, LogOut, Save, MessageCircle, ClipboardList, 
  BarChart2, Edit3, X, Sparkles, Info, Wind, Phone ,BookHeart// Importar iconos nuevos
} from 'lucide-react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { signOut, updateProfile } from 'firebase/auth';
import Button from '../components/ui/Button';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import CrisisModal from '../components/CrisisModal'; // Importar Modal

const ProfilePage = ({ onNavigate }) => {
  const [userData, setUserData] = useState(null);
  const [bio, setBio] = useState('');
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [miniChartData, setMiniChartData] = useState([]);
  const [showCrisisModal, setShowCrisisModal] = useState(false); // Estado para el modal SOS

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;

      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setBio(data.bio || '');
        setFullName(data.full_name || auth.currentUser.displayName || '');
      } else {
        const newProfile = {
          full_name: auth.currentUser.displayName || 'Usuario',
          email: auth.currentUser.email,
          bio: '',
          created_at: serverTimestamp(),
          role: 'user'
        };
        await setDoc(docRef, newProfile);
        setUserData(newProfile);
        setFullName(newProfile.full_name);
      }

      const assessmentsRef = collection(db, 'users', uid, 'assessments');
      const q = query(assessmentsRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const docs = querySnapshot.docs.map(d => d.data());
      if (docs.length > 0) {
        setLastScore(docs[docs.length - 1]);
        setMiniChartData(docs.slice(-5).map(d => ({ score: d.score || d.totalScore })));
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, { full_name: fullName, bio: bio });
      await updateProfile(auth.currentUser, { displayName: fullName });
      setUserData(prev => ({ ...prev, full_name: fullName, bio: bio }));
      setIsEditing(false);
      alert("Perfil actualizado");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-5xl mx-auto animate-fade-in">
        
        {/* --- HEADER DEL DASHBOARD --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Hola, {fullName.split(' ')[0] || 'Usuario'} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-gray-500">Bienvenido a tu espacio de bienestar personal.</p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            

             {/* BOTÓN SOS (NUEVO) */}
             <button 
               onClick={() => setShowCrisisModal(true)}
               className="px-4 py-2 bg-red-100 text-red-600 rounded-xl border border-red-200 shadow-sm hover:bg-red-200 flex items-center gap-2 transition-all font-bold animate-pulse"
               title="Ayuda Urgente"
             >
               <Phone size={18} className="fill-current"/>
               <span>SOS</span>
             </button>

             <button 
               onClick={() => onNavigate('about')}
               className="px-4 py-2 bg-white text-gray-600 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-all"
             >
               <Info size={18}/>
               <span className="hidden md:inline">Créditos</span>
             </button>

             <button 
               onClick={() => setIsEditing(!isEditing)}
               className="px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-all"
             >
               {isEditing ? <X size={18}/> : <Edit3 size={18}/>}
               <span className="hidden md:inline">{isEditing ? 'Cerrar' : 'Editar'}</span>
             </button>
             
             <button 
               onClick={() => signOut(auth)}
               className="px-4 py-2 bg-white text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all flex items-center gap-2"
             >
               <LogOut size={18}/>
             </button>
          </div>

          
        </header>

        {/* Formulario de Edición */}
        {isEditing && (
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-indigo-100 mb-8 animate-fade-in">
             <h3 className="font-bold text-lg mb-4 text-gray-800">Ajustes de Perfil</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                   <input 
                      type="text" 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Bio (Contexto para la IA)</label>
                   <textarea 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      rows="3"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                   />
                </div>
             </div>
             <div className="flex justify-end">
                <Button onClick={handleSave} icon={Save}>Guardar Cambios</Button>
             </div>
          </div>
        )}

        {/* --- GRID DE WIDGETS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* 1. CHAT */}
           <div 
              onClick={() => onNavigate('chat')}
              className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 cursor-pointer transform transition-all hover:scale-[1.01] group relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                 <MessageCircle size={200} />
              </div>
              <div className="relative z-10">
                 <div className="bg-white/20 w-fit p-3 rounded-2xl mb-4 backdrop-blur-sm">
                    <Sparkles size={24} className="text-yellow-300" />
                 </div>
                 <h2 className="text-2xl font-bold mb-2">Hablar con Health-AI</h2>
                 <p className="text-indigo-100 mb-6 max-w-md">
                    Tu asistente emocional disponible 24/7. Conversa, desahógate y recibe consejos basados en evidencia.
                 </p>
                 <span className="inline-flex items-center gap-2 bg-white text-indigo-700 px-5 py-2 rounded-full font-bold text-sm group-hover:bg-indigo-50 transition-colors">
                    Iniciar Conversación <MessageCircle size={16} />
                 </span>
              </div>
           </div>

           {/* 2. ESTADÍSTICAS */}
           <div 
              onClick={() => onNavigate('stats')}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:border-indigo-200 transition-all group flex flex-col justify-between"
           >
              <div>
                 <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                       <BarChart2 size={24} />
                    </div>
                    {lastScore && (
                       <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          Reciente
                       </span>
                    )}
                 </div>
                 <h3 className="text-lg font-bold text-gray-800">Mi Progreso</h3>
                 <p className="text-sm text-gray-500">
                    {lastScore ? `Estado: ${lastScore.interpretation}` : "Sin datos aún"}
                 </p>
              </div>
              <div className="h-24 w-full mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={miniChartData}>
                       <Area type="monotone" dataKey="score" stroke="#4F46E5" fill="#E0E7FF" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* 3. EVALUACIÓN */}
           <div 
              onClick={() => onNavigate('assessment')}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:border-blue-200 transition-all"
           >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4">
                 <ClipboardList size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Chequeo Emocional</h3>
              <p className="text-gray-500 text-sm mb-4">
                 Mide tus niveles de ansiedad, depresión y estrés con nuestro test clínico.
              </p>
              <span className="text-blue-600 font-bold text-sm flex items-center gap-1">
                 Empezar Test →
              </span>
           </div>

           {/* 4. RESPIRACIÓN (NUEVO WIDGET) */}
           <div 
              onClick={() => onNavigate('breathing')}
              className="md:col-span-2 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-3xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
           >
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
                 <Wind size={180} />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-bold mb-2">Momento de Calma</h3>
                    <p className="text-teal-50 max-w-md">
                       ¿Sientes ansiedad ahora mismo? Entra aquí para un ejercicio guiado de respiración de 1 minuto.
                    </p>
                 </div>
                 <div className="bg-white/20 p-4 rounded-full backdrop-blur-md group-hover:scale-110 transition-transform">
                    <Wind size={32} className="text-white" />
                 </div>
              </div>
           </div>

            {/* 5. DIARIO (NUEVO WIDGET) */}
           <div 
              onClick={() => onNavigate('journal')}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:border-pink-200 transition-all flex items-center justify-between group"
           >
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl group-hover:scale-110 transition-transform">
                    <BookHeart size={32} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-800">Diario Inteligente</h3>
                    <p className="text-gray-500 text-sm">Registra tus días y recibe feedback.</p>
                 </div>
              </div>
           </div>

        </div>
        
      </div>

      {/* MODAL DE CRISIS */}
      <CrisisModal isOpen={showCrisisModal} onClose={() => setShowCrisisModal(false)} />

    </div>
  );
};

export default ProfilePage;