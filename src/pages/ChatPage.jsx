

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Loader2, Trash2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { getSmartResponse } from '../services/ai'; 
import { auth, db } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  getDocs
} from 'firebase/firestore';

const ChatPage = ({ onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userBio, setUserBio] = useState('');
  
  // Estados para Voz
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const messagesEndRef = useRef(null);
  const user = auth.currentUser;

  // 1. Configurar Reconocimiento de Voz (Al cargar)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'es-ES';
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsListening(false);
            // Opcional: Enviar automáticamente al terminar de hablar
            // handleSend(null, transcript); 
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Error de voz:", event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }
  }, []);

  // 2. Cargar Bio
  useEffect(() => {
    if (user) {
      const fetchBio = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) setUserBio(snap.data().bio || '');
        } catch (error) { console.error("Error bio:", error); }
      };
      fetchBio();
    }
  }, [user]);

  // 3. Historial de Chat
  useEffect(() => {
    if (!user) return;
    const chatRef = collection(db, 'users', user.uid, 'chat_history');
    const q = query(chatRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        addDoc(chatRef, {
          text: 'Hola, soy Health-AI. Estoy aquí para escucharte. ¿Cómo te sientes hoy?',
          role: 'bot',
          createdAt: serverTimestamp()
        });
      } else {
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(history);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- FUNCIONES DE VOZ ---
  
  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current.stop();
    } else {
        recognitionRef.current.start();
        setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (synthRef.current.speaking) {
        synthRef.current.cancel();
        setIsSpeaking(false);
        return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1; // Velocidad normal
    utterance.onend = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  // --- ENVIAR MENSAJE ---
  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    setInput('');
    setLoading(true);

    try {
      await addDoc(collection(db, 'users', user.uid, 'chat_history'), {
        text: textToSend,
        role: 'user',
        createdAt: serverTimestamp()
      });

      const botResponseText = await getSmartResponse(textToSend, userBio);

      await addDoc(collection(db, 'users', user.uid, 'chat_history'), {
        text: botResponseText,
        role: 'bot',
        createdAt: serverTimestamp()
      });

      // Leemos la respuesta automáticamente si el usuario usó voz recientemente (opcional)
      // O simplemente dejamos que el usuario pulse el botón de hablar.

    } catch (error) {
      console.error("Error en chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (window.confirm("¿Borrar conversación?")) {
      const chatRef = collection(db, 'users', user.uid, 'chat_history');
      const snapshot = await getDocs(chatRef);
      snapshot.forEach(doc => deleteDoc(doc.ref));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      
      {/* HEADER */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <div className="bg-indigo-600 p-2 rounded-full shadow-md">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">MindfulAI</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500 font-medium">Voz Activa</span>
            </div>
          </div>
        </div>
        
        <button onClick={clearHistory} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 size={20} />
        </button>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#F8FAFC]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${
              msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-green-600'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm relative group ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              {msg.text?.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
              ))}

              {/* Botón para leer en voz alta (solo mensajes del bot) */}
              {msg.role === 'bot' && (
                  <button 
                    onClick={() => speakText(msg.text)}
                    className="absolute -right-8 top-2 p-1 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Leer en voz alta"
                  >
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-end gap-2 animate-fade-in">
             <div className="w-8 h-8 bg-white text-green-600 rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                <Bot size={16} />
             </div>
             <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT + MICRÓFONO */}
      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          
          {/* Botón de Micrófono */}
          <button
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all shadow-sm ${
                isListening 
                ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Hablar"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all outline-none shadow-inner text-gray-700 placeholder-gray-400"
              placeholder={isListening ? "Escuchando..." : "Escribe o habla..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform active:scale-95"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;