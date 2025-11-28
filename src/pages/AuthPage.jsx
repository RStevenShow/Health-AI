import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, User, Activity, X, ArrowRight } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail // Importar función de reset
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; 
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Estados para Recuperación de Contraseña
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // --- LÓGICA DE AUTH (Login/Registro) ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          full_name: name,
          email: email,
          bio: '', 
          created_at: serverTimestamp(),
          role: 'user'
        });

        await updateProfile(user, { displayName: name });
      }
    } catch (err) {
      console.error(err);
      let msg = "Ocurrió un error. Intenta de nuevo.";
      if (err.code === 'auth/invalid-email') msg = "El correo no es válido.";
      if (err.code === 'auth/user-not-found') msg = "No existe cuenta con este correo.";
      if (err.code === 'auth/wrong-password') msg = "Contraseña incorrecta.";
      if (err.code === 'auth/email-already-in-use') msg = "Este correo ya está registrado.";
      if (err.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE RESET PASSWORD ---
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("¡Listo! Revisa tu correo para cambiar la contraseña.");
      setTimeout(() => {
          setShowResetModal(false);
          setResetMessage("");
      }, 3000);
    } catch (err) {
      setResetMessage("Error: No pudimos enviar el correo. Verifica que esté bien escrito.");
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      
      {/* MODAL DE RECUPERACIÓN */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
              <button 
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                 <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Recuperar Acceso</h3>
              <p className="text-gray-500 text-sm mb-4">Ingresa tu correo y te enviaremos un enlace mágico.</p>
              
              {resetMessage ? (
                 <div className={`p-3 rounded-lg text-sm font-medium mb-4 ${resetMessage.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {resetMessage}
                 </div>
              ) : (
                 <form onSubmit={handlePasswordReset}>
                    <InputField 
                       label="Correo Electrónico" 
                       type="email" 
                       value={resetEmail} 
                       onChange={(e) => setResetEmail(e.target.value)}
                       placeholder="ejemplo@correo.com"
                       icon={Mail}
                    />
                    <div className="mt-4 flex justify-end">
                       <Button type="submit">Enviar Enlace</Button>
                    </div>
                 </form>
              )}
           </div>
        </div>
      )}

      {/* TARJETA PRINCIPAL */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Lado Izquierdo (Marca) */}
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
              <BrainCircuit className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Health-AI</h1>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Tu espacio seguro. <br/>
              Inteligencia artificial que te escucha, te entiende y te acompaña.
            </p>
          </div>
          
          <div className="relative z-10 text-sm font-medium text-indigo-200">
            © 2025 Proyecto Salud Mental
          </div>
        </div>

        {/* Lado Derecho (Formulario) */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
            </h2>
            <p className="text-gray-500 mb-8">
              {isLogin ? 'Ingresa tus datos para continuar.' : 'Comienza tu viaje de bienestar hoy.'}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3 animate-pulse">
                <Activity className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-2">
              {!isLogin && (
                <InputField 
                  label="Nombre Completo" 
                  type="text" 
                  placeholder="Ej. Ana García" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  icon={User}
                />
              )}
              
              <InputField 
                label="Correo Electrónico" 
                type="email" 
                placeholder="nombre@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />
              
              <div>
                 <InputField 
                   label="Contraseña" 
                   type="password" 
                   placeholder="••••••••" 
                   value={password} 
                   onChange={(e) => setPassword(e.target.value)}
                   icon={Lock}
                 />
                 {/* Enlace de Recuperación (Solo en Login) */}
                 {isLogin && (
                   <div className="flex justify-end mt-1">
                      <button 
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                   </div>
                 )}
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse Gratis')}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? '¿Nuevo aquí?' : '¿Ya tienes cuenta?'}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="ml-2 text-indigo-600 font-bold hover:underline transition-colors"
                >
                  {isLogin ? 'Crea una cuenta' : 'Ingresa ahora'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;