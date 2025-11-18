# DJMesh TODO

## Current Issues

### 1. Play buttons not working
- [x] Fixed syntax errors in djconsole.js
- [x] Added automatic track loading for both decks
- [x] Restored EQ (effects) functionality
- [x] Added volume controls for each deck
- [x] Fixed event listeners for transport controls

## DJ Console Improvements

### 1. Implementar EQ Real con Web Audio API
- [x] Crear BiquadFilterNodes para LOW, MID, HIGH
- [x] Conectar filters al chain de audio
- [x] Permitir ajuste en tiempo real de frecuencias
- [ ] Añadir visualización de curvas de EQ

### 2. Añadir Indicadores Visuales de Estado
- [x] LEDs para estado de reproducción (playing/paused/stopped)
- [x] Display de BPM actual en tiempo real
- [x] VU meters funcionales para cada deck
- [x] Indicador de crossfader position
- [ ] Visual feedback para botones presionados

### 3. Waveforms Funcionales
- [x] Permitir click en waveform para seek
- [x] Mostrar posición actual de reproducción
- [x] Visualización de waveform real desde buffer de audio

### 4. Mejorar la Experiencia de Usuario
- [ ] Mostrar mensajes claros cuando no hay tracks cargados
- [ ] Animaciones y feedback visual en botones
- [ ] Atajos de teclado (Space: play/pause, flechas: navegación)
- [ ] Tooltips para controles
- [ ] Prevención de errores comunes

### 5. Optimizar el Ruteo de Audio
- [ ] Reutilizar nodes existentes en lugar de crear nuevos
- [ ] Implementar smooth transitions al cambiar tracks
- [ ] Añadir fade in/out al iniciar/detener
- [ ] Optimizar performance de audio
- [ ] Evitar clicks y pops en transiciones

### 6. Mejoras Adicionales
- [ ] Zoom en waveform
- [ ] Marcar cue points en waveform
- [ ] Guardar posiciones de tiempo para cue points
- [ ] Permitir saltar a cue points
- [ ] Hot cues con atajos de teclado
- [ ] Auto-cue al inicio de tracks

### 7. Mejorar el Crossfader
- [ ] Implementar curvas de transición personalizables
- [ ] Kill switches para frecuencias (LOW/MID/HIGH)
- [ ] Visualización más clara de posición
- [ ] Smooth curve transitions
- [ ] Assignable crossfader curves

## Implementation Priority

1. **High Priority**: Visual feedback para botones, Zoom en waveform, Cue Points avanzados
2. **Medium Priority**: Mejoras UX, Optimización Audio (performance)  
3. **Low Priority**: Crossfader Mejorado, Atajos de teclado

## Legacy TODO Items (Client.js fixes)

### AudioContext Creation Issues
- [ ] Consolidate AudioContext creation in one place
- [ ] Add proper error handling for AudioContext creation
- [ ] Ensure AudioContext is only created after user interaction on mobile
- [ ] Fix multiple AudioContext instances being created

### Memory Leaks - Event Listeners
- [ ] Add removeEventListener calls for all event listeners
- [ ] Implement proper cleanup in destroy methods
- [ ] Fix touch event listeners that aren't being removed
- [ ] Add event listener cleanup when components are destroyed

### Mobile Touch Event Handling
- [ ] Fix touch event listeners to prevent memory leaks
- [ ] Add proper touch event cleanup
- [ ] Ensure touch events work correctly on all mobile devices
- [ ] Add passive event listeners where appropriate

### WebSocket Reconnection Logic
- [ ] Improve reconnection strategy with exponential backoff
- [ ] Add better error handling for connection failures
- [ ] Implement connection state management
- [ ] Add timeout handling for reconnection attempts

### Audio Player Mobile Initialization
- [ ] Delay audio initialization until user interaction
- [ ] Fix audio loading issues on mobile browsers
- [ ] Add proper audio context resumption
- [ ] Ensure audio works after page reload on mobile

### General Code Quality
- [ ] Add proper error boundaries
- [ ] Implement cleanup methods for all classes
- [ ] Fix any remaining memory leaks
- [ ] Add proper logging for debugging
