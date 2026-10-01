# 🔠 Wordle en Español

Juego web interactivo de adivinación de palabras basado en la mecánica de Wordle, desarrollado con **HTML5, CSS3 y JavaScript Vanilla**, con persistencia de datos local y carga dinámica de diccionario.

---

## ✨ Características

- **Palabras Dinámicas:** Diccionario filtrado por longitud (5, 6, 7 y 8 letras) cargado desde CDN externo con respaldo local.
- **Soporte de Caracteres:** Limpieza automática de tildes manteniendo la **Ñ**.
- **Diseño Moderno & Animaciones:** Interfaz estilo *Dark Mode*, animaciones de volteo (*flip*) de casillas y celebración con confeti al ganar.
- **Dificultad Adaptativa:** 6 intentos para 5–6 letras; 7 intentos para 7–8 letras.
- **Ranking y Usuarios:** Persistencia en `localStorage` con apodo de jugador y tabla de posiciones Top 10 calculada por tiempo e intentos.
- **Entrada Dual:** Teclado físico y virtual en pantalla.

---

## 📁 Estructura del Proyecto

```plaintext
proyecto_miercoles/
│
├── index.html          # Estructura principal, modales y canvas
├── style.css           # Estilos, diseño responsivo y animaciones CSS
└── js/
    ├── words.js        # Carga asíncrona y limpieza del diccionario
    ├── storage.js      # Manejo de usuarios y ranking en localStorage
    └── app.js          # Lógica del juego, eventos e interfaz