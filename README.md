Health-Ai - Asistente de Salud Mental Inteligente 🧠💙

Health-Ai es una plataforma web progresiva (PWA) diseñada para democratizar el acceso al apoyo emocional y la salud mental. Utiliza Inteligencia Artificial avanzada (Google Gemini) entrenada con guías clínicas oficiales para ofrecer acompañamiento, evaluación y seguimiento emocional accesible, seguro y gratuito.

✨ Características Principales

🤖 Chatbot Empático RAG: Asistente virtual que no "alucina". Sus respuestas están fundamentadas en una base de conocimiento clínica (OMS, Guías de Práctica Clínica) inyectada en tiempo real.

📊 Evaluación Clínica Multidimensional: Tests validados (basados en PHQ-9 y GAD-7) para medir niveles de Depresión, Ansiedad y Estrés, con análisis instantáneo por IA.

📈 Dashboard de Progreso: Visualización gráfica de la evolución emocional del usuario a lo largo del tiempo.

🎙️ Interacción por Voz: Accesibilidad total permitiendo hablar con la IA y escuchar sus respuestas.

🛡️ Protocolos de Seguridad: Detección de riesgo y botón SOS con recursos de emergencia inmediatos.

📓 Diario Inteligente: Registro personal donde la IA analiza las emociones del día y ofrece una reflexión terapéutica ("Semilla de Sabiduría").

🧘 Herramientas de Bienestar: Ejercicios guiados de respiración y registro de estado de ánimo diario ("Mood Ring").

🛠️ Tecnologías Utilizadas

Frontend

React + Vite: Para una experiencia de usuario ultra rápida y fluida.

Tailwind CSS: Diseño responsivo "Mobile First" moderno y limpio.

Recharts: Visualización de datos y gráficas médicas.

Lucide React: Iconografía intuitiva y accesible.

Backend & Servicios

Firebase Authentication: Gestión segura de usuarios y sesiones.

Firebase Firestore: Base de datos NoSQL en tiempo real para historiales y perfiles.

Google Gemini API (2.5 Flash): Motor de IA generativa con ventana de contexto extendida para procesamiento de manuales médicos.

Web Speech API: Reconocimiento y síntesis de voz nativa.

🚀 Instalación y Despliegue Local

Si deseas correr este proyecto en tu máquina local:

Clonar el repositorio:

git clone [https://github.com/TU_USUARIO/mindful-ai-app.git](https://github.com/TU_USUARIO/mindful-ai-app.git)
cd Health-Ai


Instalar dependencias:

npm install


Configurar Variables de Entorno:
Crea un archivo .env en la raíz y añade tus claves:

VITE_GEMINI_API_KEY=tu_api_key_de_google
# Añade aquí tus credenciales de Firebase si no están en el código


Ejecutar el servidor de desarrollo:

npm run dev


📚 Base de Conocimiento (Fuentes)

La IA de este proyecto ha sido instruida utilizando documentación oficial y pública:

Manual de Recursos de la OMS sobre Salud Mental.

Guías de Autoayuda para la Depresión y los Trastornos de Ansiedad (Servicio Andaluz de Salud).

Guía de Trastornos Mentales (Instituto Nacional de Neuroeducación).

🤝 Contribución

¡Las contribuciones son bienvenidas! Si eres desarrollador, psicólogo o diseñador y quieres mejorar Health-Ai:

Haz un Fork del proyecto.

Crea una rama para tu funcionalidad (git checkout -b feature/NuevaMejora).

Haz Commit de tus cambios (git commit -m 'Añadir nueva mejora').

Haz Push a la rama (git push origin feature/NuevaMejora).

Abre un Pull Request.

📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE.md para más detalles.

Desarrollado con ❤️ para mejorar la salud mental global.
