# DJMesh 🎵

## Red Social Minimalista para DJs

DJMesh es una plataforma social innovadora diseñada exclusivamente para la comunidad de DJs. Construida desde cero con recursos limitados, esta aplicación web ofrece una experiencia única de networking musical sin las distracciones de las redes sociales tradicionales.

### 🌟 Características Principales

#### 📱 **Posts Efímeros Inteligentes**
- **Posts generales**: 1 por día por usuario, duran 24 horas
- **Posts importantes**: Persisten hasta su resolución (colaboraciones, proyectos, eventos)
- **Sistema de tipos**: Mixes, tracks, colaboraciones, eventos, equipo, búsquedas
- **Interacciones**: Sistema de reacciones y comentarios en tiempo real

#### 💬 **Sistema de Inbox Privado**
- Mensajes privados entre DJs
- Mensajes expiran automáticamente en 24 horas
- Notificaciones en tiempo real
- Interfaz intuitiva con pestañas

#### 🎛️ **Consola DJ Profesional**
- **Reproductor avanzado**: Waveform interactiva, controles de tempo/pitch
- **Efectos en tiempo real**: Reverb, delay, distortion, phaser
- **Cue points y loops**: Hasta 8 puntos de cue, regiones de loop
- **EQ 3-bandas**: Con kill switches para cada banda
- **Filtro dinámico**: LP, HP, BP con control de frecuencia y Q
- **Visualización**: Espectro de frecuencia y BPM circular

#### 🎵 **Sistema Musical Inteligente**
- **Playlist diaria**: Lista aleatoria compartida entre todos los usuarios
- **Reproductor móvil optimizado**: Controles táctiles, precarga inteligente
- **SACM Tracking**: Analytics musicales para derechos de autor
- **Fondo dinámico**: Cambia según la canción reproduciéndose

#### 🔧 **Tecnología y Arquitectura**
- **Backend**: Node.js con WebSockets para comunicación en tiempo real
- **Persistencia**: Google Sheets (sin base de datos tradicional)
- **Frontend**: Vanilla JavaScript, CSS moderno, diseño responsive
- **Audio**: Web Audio API para procesamiento avanzado
- **Despliegue**: Render.com + GitHub (código abierto)

### 🚀 **Iniciativa Propia**

Este proyecto es una **iniciativa completamente propia**:
- ✅ **Código abierto**: Disponible en GitHub
- ✅ **Sin recursos externos**: Construido desde cero
- ✅ **No intrusivo**: Sin trackers, sin anuncios, sin datos vendidos
- ✅ **Minimalista**: Enfoque en la funcionalidad esencial
- ✅ **Comunidad-first**: Diseñado por y para DJs

### 📋 **Funcionalidades por Categoría**

#### 🎧 **Herramientas para DJs**
1. **Mixes**: Comparte tus sets y mezclas
2. **Tracks**: Descubre nuevas pistas
3. **Colaboraciones**: Encuentra DJs para trabajar juntos
4. **Eventos**: Organiza y promociona fiestas
5. **Equipo**: Compra/venta de equipo DJ
6. **Búsquedas**: Encuentra gigs, estudios, oportunidades

#### 🎯 **Sistema de Posts Inteligente**
- Posts importantes persisten (colaboraciones, proyectos, eventos)
- Sistema de resolución para marcar posts como completados
- Visual decay: posts pierden interacciones con el tiempo
- Masonry layout con tamaños inteligentes

#### 📊 **Analytics y Tracking**
- SACM tracking automático para derechos musicales
- Contador de usuarios online en tiempo real
- Backup automático cada 3 minutos
- Reportes de reproducción musical

### 🛠️ **Instalación y Despliegue**

#### Requisitos
- Node.js >= 18.0.0
- Cuenta Google Cloud (para Google Sheets)
- Variables de entorno configuradas

#### Variables de Entorno
```env
PORT=10000
GOOGLE_SERVICE_EMAIL=tu-email@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=tu-clave-privada
SHEET_ID=id-de-tu-sheet-sACM
SHEET_ID_2=id-de-tu-sheet-posts-inbox
```

#### Instalación Local
```bash
git clone https://github.com/tu-usuario/djmesh.git
cd djmesh
npm install
npm start
```

#### Despliegue en Render.com
1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno
3. Despliega automáticamente

### 🎨 **Diseño y UX**

- **Tema oscuro/claro**: Toggle para cambiar entre modos
- **Responsive**: Optimizado para móviles y desktop
- **Animaciones sutiles**: Sin movimientos intrusivos
- **OLED-style displays**: Interfaz inspirada en equipos profesionales
- **Neon aesthetics**: Colores cyan/magenta/amarillo para ambiente techno

### 🔮 **Visión y Futuro**

DJMesh aspira a ser el **punto de encuentro digital** para la comunidad DJ global:
- Conexiones reales entre artistas
- Herramientas prácticas para la producción musical
- Espacio libre de algoritmos manipuladores
- Comunidad que se apoya mutuamente

### 📞 **Contacto**

Este proyecto es mantenido por Adrian Paredes como iniciativa personal. El código está abierto para contribuciones y mejoras de la comunidad.

---

**DJMesh - Donde los DJs se conectan, crean y colaboran.** 🎛️✨
