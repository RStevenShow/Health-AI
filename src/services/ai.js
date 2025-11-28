import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Palabras clave para filtrar documentos
const KEYWORDS = ['estrés', 'ansiedad', 'depresión', 'tristeza', 'miedo', 'preocupación', 'angustia'];
const MODEL_NAMES = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-latest",
  "gemini-pro",
  "gemini-2.0-pro"
];

// --- FUNCIÓN 3: ANÁLISIS DE DIARIO (NUEVO) ---
export const analyzeJournalEntry = async (entryText) => {
  try {
    const prompt = `
      Actúa como un mentor sabio y compasivo.
      El usuario ha escrito esto en su diario personal:
      "${entryText}"
      
      TU TAREA:
      1. Identifica la emoción principal (ej. Frustración, Alegría, Nostalgia).
      2. Escribe una "Reflexión Semilla": Una frase corta (max 20 palabras), inspiradora o una pregunta poderosa relacionada con lo que escribió, para ayudarle a sanar o celebrar.
      
      FORMATO DE RESPUESTA (JSON implícito):
      Emoción: [Emoción]
      Reflexión: [Frase]
    `;

    // Intentamos con la lista de modelos
    for (const modelName of MODEL_NAMES) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e) {
            continue;
        }
    }
    return "Emoción: Neutro\nReflexión: Gracias por registrar tus pensamientos hoy.";

  } catch (error) {
    console.error("Error analizando diario:", error);
    return "Emoción: Desconocida\nReflexión: Escribir es el primer paso para sanar.";
  }
};

export const analyzeAssessment = async (questions, answers, contextString) => {
  try {
    // Preparamos el informe para la IA
    let clinicalReport = contextString; 
    
    // Si no viene formateado, lo construimos (compatibilidad)
    if (typeof contextString !== 'string') {
        clinicalReport = "RESULTADOS DEL TEST:\n";
        questions.forEach(q => {
            const val = answers[q.id] || 0;
            clinicalReport += `- ${q.text}: ${val}\n`;
        });
    }

    const prompt = `
      Actúa como un Psicólogo Clínico experto.
      Analiza estos resultados de una evaluación de salud mental:
      
      ${clinicalReport}
      
      TU TAREA:
      Escribe un párrafo de "Impresión Clínica" (máximo 80 palabras) dirigido al paciente ("Tú").
      - Sé empático pero directo.
      - No diagnostiques ("tienes depresión"), usa "tus resultados sugieren...".
      - Menciona qué área (Ansiedad, Estrés, Depresión) requiere más atención.
      - Termina con un mensaje de esperanza.
    `;

    // Intentamos con la lista de modelos para asegurar que funcione
    for (const modelName of MODEL_NAMES) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e) {
            continue;
        }
    }
    return "Tus resultados han sido guardados, pero no pude generar el análisis de texto en este momento.";

  } catch (error) {
    console.error("Error analizando test:", error);
    return "Análisis no disponible por el momento.";
  }
};
export const getSmartResponse = async (userMessage, userBio) => {
  try {
    // 1. TRAER CONOCIMIENTOS
    const knowledgeRef = collection(db, 'knowledge_base');
    const snapshot = await getDocs(knowledgeRef);

    let filteredKnowledge = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.content || !data.title) return;
      const contentLower = data.content.toLowerCase();

      if (KEYWORDS.some(word => userMessage.toLowerCase().includes(word) && contentLower.includes(word))) {
        filteredKnowledge += `\n--- FUENTE: ${data.title} ---\n${data.content}\n`;
      }
    });

    // 2. PROMPT PRINCIPAL
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

   const systemInstruction = `
Eres **Health-AI**, un acompañante psicológico profesional, empático y humano.
Tu estilo es cálido, respetuoso y cercano, pero siempre profesional. 

=========================
ESTILO PROFESIONAL
=========================
- Hablas como un psicólogo clínico con tacto humano.
- Eres empático pero no uses expresiones románticas ni familiares (no usar: cariño, corazón, mi amor, etc.).
- Tono calmado, seguro y claro.
- Validas emociones sin exagerar.
- No suenas como un amigo íntimo, sino como un profesional que acompaña y escucha.
- No das diagnósticos clínicos.
- No usas tecnicismos, pero sí explicaciones claras.
- Ofreces pasos pequeños, realistas y orientados al bienestar.

=========================
REGLAS DE FORMATO
=========================
- Usa negritas con formato markdown normal: **así**.
- No muestres asteriscos sueltos.
- No uses viñetas con un solo *, usa guiones: "- algo".
- Las listas deben usar:
  - "- ejemplo"
- No uses formatos incorrectos con asteriscos.

=========================
CONOCIMIENTO RELEVANTE
=========================
${filteredKnowledge || "No se encontró contenido relevante. Usa únicamente tus habilidades profesionales y empáticas."}

=========================
PERFIL DEL USUARIO
=========================
${userBio || "Usuario nuevo."}
`;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "Entendido. Seguiré todas las reglas como Health-AI." }] },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();

  } catch (error) {
    console.error("Error en IA:", error);

    // 3. FALLBACK: SEGUIR SIENDO Health-AI, SIN USAR FIREBASE
    try {
      console.log("Fallback: IA sin conocimiento externo, pero manteniendo estilo Health-AI.");

      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const fallbackPrompt = `
Eres **Health-AI**, un acompañante psicológico profesional, humano y empático.
No tienes acceso a la biblioteca externa, pero mantienes un estilo clínico cálido y respetuoso.

REGLAS:
- Tono profesional, calmado y cercano.
- No uses expresiones románticas, afectivas o familiares (no decir: cariño, mi cielo, corazón).
- Valida emociones de forma profesional, sin exageración.
- Usa lenguaje claro, humano y sin tecnicismos.
- No diagnostiques, no prescribas tratamientos.
- Usa markdown normal para negritas: **así**.
- Listas solo con guiones (-).

PERFIL DEL USUARIO:
${userBio || "Usuario nuevo."}
`;

      const fallbackChat = fallbackModel.startChat({
        history: [
          { role: "user", parts: [{ text: fallbackPrompt }] },
          { role: "model", parts: [{ text: "Estoy aquí contigo, listo para escuchar." }] },
        ],
      });

      const fallbackResult = await fallbackChat.sendMessage(userMessage);
      return fallbackResult.response.text();

    } catch (fallbackError) {
      console.error("Error en fallback:", fallbackError);
      return "Lo siento, ocurrió un problema técnico. Por favor, intenta de nuevo.";
    }
  }
};
