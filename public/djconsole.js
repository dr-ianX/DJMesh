// 🎛️ DJ CONSOLE PROFESIONAL - VERSIÓN MEJORADA
// Consola de DJ optimizada para DJMesh

class DJConsole {
    constructor() {
        // Inicializar propiedades básicas
        this.audioContext = null;
        this.audioBuffer = null;
        this.source = null;
        this.analyser = null;
        this.gainNode = null;

        // Configuración inicial
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 0.8;
        this.bpm = 128;
        this.currentTrack = null;

        // Efectos y controles
        this.eq = { low: 0, mid: 0, high: 0 };
        this.killSwitches = { low: false, mid: false, high: false };
        this.filter = { type: 'off', frequency: 1000, Q: 1 };
        this.effects = {
            reverb: { mix: 0, decay: 2 },
            delay: { time: 0.5, feedback: 0.3 },
            distortion: { drive: 0 },
            phaser: { rate: 0.5 }
        };
        this.crossfader = 0.5;
        this.crossfaderCurve = 1;
        this.tempo = 1.0;
        this.cuePoints = new Array(8).fill(null);
        this.loopRegion = { start: null, end: null, active: false };

        // Referencias a elementos del DOM
        this.elements = {};

        console.log('🎛️ DJ Console Avanzada inicializada');
    }

    async init() {
        console.log('🎛️ Inicializando DJ Console...');
        try {
            // 🆕 Verificar que el DOM esté listo
            if (!document.getElementById('dj-console')) {
                throw new Error('Elemento dj-console no encontrado en el DOM');
            }

            console.log('🎛️ Creando UI de consola...');
            this.createConsoleUI();

            console.log('🎛️ Configurando AudioContext...');
            await this.setupAudioContext();

            console.log('🎛️ Configurando event listeners...');
            this.setupEventListeners();

            console.log('🎛️ Cargando track por defecto...');
            await this.loadDefaultTrack();

            console.log('✅ DJ Console lista');
        } catch (error) {
            console.error('❌ Error inicializando DJ Console:', error);
            console.error('Stack trace:', error.stack);
            throw error; // Re-lanzar para que sea capturado en el HTML
        }
    }

    createConsoleUI() {
        // Reemplazar el reproductor simple con la consola avanzada
        const oldPlayer = document.getElementById('musicPlayerContainer');
        if (oldPlayer) oldPlayer.remove();

        const consoleHTML = `
            <div class="dj-console" id="djConsole">
                <!-- 🖥️ PANTALLA PRINCIPAL OLED-STYLE -->
                <div class="console-screen">
                    <div class="oled-display">
                        <div class="track-info">
                            <span class="track-name" id="trackName">DJMESH - CONSOLE</span>
                            <span class="track-artist" id="trackArtist">TECHNO CONTEMPORÁNEO</span>
                            <span class="bpm-display" id="bpmDisplay">BPM: 128</span>
                        </div>
                        <div class="time-display">
                            <span id="currentTime">00:00</span>
                            <span id="totalTime">00:00</span>
                        </div>
                    </div>

                    <!-- 🎵 WAVEFORM INTERACTIVA -->
                    <div class="waveform-container">
                        <canvas id="mainWaveform" width="800" height="120"></canvas>
                        <div class="waveform-overlay">
                            <div class="cue-points" id="cuePoints"></div>
                            <div class="loop-region" id="loopRegion"></div>
                            <div class="playhead" id="playhead"></div>
                        </div>
                    </div>

                    <!-- 📊 VISUALIZADORES MÚLTIPLES -->
                    <div class="visualizers">
                        <canvas id="spectrumViz" width="200" height="80"></canvas>
                        <canvas id="circularBPM" width="80" height="80"></canvas>
                    </div>
                </div>

                <!-- 🎚️ CONTROLES PROFESIONALES -->
                <div class="console-controls">
                    <!-- CROSSFADER Y TEMPO -->
                    <div class="mixer-section">
                        <div class="crossfader-container">
                            <label>Crossfader</label>
                            <input type="range" id="crossfader" min="0" max="1" step="0.01" value="0.5">
                            <div class="crossfader-curve">
                                <label>Curve</label>
                                <input type="range" id="crossfaderCurve" min="0.1" max="3" step="0.1" value="1">
                            </div>
                        </div>

                        <div class="tempo-container">
                            <label>Tempo</label>
                            <input type="range" id="tempoControl" min="0.5" max="1.5" step="0.01" value="1">
                            <button id="tempoReset" class="control-btn">RESET</button>
                            <span id="tempoDisplay">100%</span>
                        </div>
                    </div>

                    <!-- EQ 3-BANDAS -->
                    <div class="eq-section">
                        <div class="eq-band">
                            <label>LOW</label>
                            <input type="range" id="eqLow" min="-20" max="20" step="1" value="0">
                            <button id="killLow" class="kill-btn">KILL</button>
                        </div>
                        <div class="eq-band">
                            <label>MID</label>
                            <input type="range" id="eqMid" min="-20" max="20" step="1" value="0">
                            <button id="killMid" class="kill-btn">KILL</button>
                        </div>
                        <div class="eq-band">
                            <label>HIGH</label>
                            <input type="range" id="eqHigh" min="-20" max="20" step="1" value="0">
                            <button id="killHigh" class="kill-btn">KILL</button>
                        </div>
                    </div>

                    <!-- FILTRO -->
                    <div class="filter-section">
                        <select id="filterType">
                            <option value="off">OFF</option>
                            <option value="lowpass">LP</option>
                            <option value="highpass">HP</option>
                            <option value="bandpass">BP</option>
                        </select>
                        <input type="range" id="filterFreq" min="20" max="20000" step="10" value="1000">
                        <input type="range" id="filterQ" min="0.1" max="10" step="0.1" value="1">
                    </div>

                    <!-- HOT CUES -->
                    <div class="cues-section">
                        <div class="cue-buttons">
                            ${Array.from({length: 8}, (_, i) =>
                                `<button class="cue-btn" data-cue="${i+1}">CUE ${i+1}</button>`
                            ).join('')}
                        </div>
                        <div class="loop-controls">
                            <button id="setLoopIn">IN</button>
                            <button id="setLoopOut">OUT</button>
                            <button id="toggleLoop">LOOP</button>
                        </div>
                    </div>
                </div>

                <!-- ✨ EFECTOS EXPANDIBLES -->
                <div class="effects-panel" id="effectsPanel">
                    <button id="toggleEffects" class="effects-toggle">🎛️ EFFECTS</button>
                    <div class="effects-controls">
                        <!-- REVERB -->
                        <div class="effect-control">
                            <label>REVERB</label>
                            <input type="range" id="reverbMix" min="0" max="1" step="0.01" value="0">
                            <input type="range" id="reverbDecay" min="0.1" max="5" step="0.1" value="2">
                        </div>

                        <!-- DELAY -->
                        <div class="effect-control">
                            <label>DELAY</label>
                            <input type="range" id="delayTime" min="0.1" max="2" step="0.01" value="0.5">
                            <input type="range" id="delayFeedback" min="0" max="0.9" step="0.01" value="0.3">
                        </div>

                        <!-- DISTORTION -->
                        <div class="effect-control">
                            <label>DISTORTION</label>
                            <input type="range" id="distortionDrive" min="0" max="1" step="0.01" value="0">
                        </div>

                        <!-- PHASER -->
                        <div class="effect-control">
                            <label>PHASER</label>
                            <input type="range" id="phaserRate" min="0" max="10" step="0.1" value="0.5">
                        </div>
                    </div>
                </div>

                <!-- 🎮 CONTROLES DE TRANSPORTE -->
                <div class="transport-controls">
                    <button id="playBtn" class="transport-btn">▶️</button>
                    <button id="pauseBtn" class="transport-btn">⏸️</button>
                    <button id="stopBtn" class="transport-btn">⏹️</button>
                    <button id="prevTrackBtn" class="transport-btn">⏮️</button>
                    <button id="nextTrackBtn" class="transport-btn">⏭️</button>
                </div>

                <!-- 📱 MENSAJE PARA MÓVILES -->
                <div id="mobileDJHelp" class="mobile-help" style="display: none;">
                    🎛️ DJ Console activada - Toca para controlar
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', consoleHTML);
        this.cacheElements();
        this.applyTechnoStyling();
        console.log('🎛️ UI de DJ Console creada');
    }

    cacheElements() {
        // Pantalla principal
        this.elements.trackName = document.getElementById('trackName');
        this.elements.trackArtist = document.getElementById('trackArtist');
        this.elements.bpmDisplay = document.getElementById('bpmDisplay');
        this.elements.currentTime = document.getElementById('currentTime');
        this.elements.totalTime = document.getElementById('totalTime');

        // Waveform
        this.elements.mainWaveform = document.getElementById('mainWaveform');
        this.elements.cuePoints = document.getElementById('cuePoints');
        this.elements.loopRegion = document.getElementById('loopRegion');
        this.elements.playhead = document.getElementById('playhead');

        // Visualizers
        this.elements.spectrumViz = document.getElementById('spectrumViz');
        this.elements.circularBPM = document.getElementById('circularBPM');

        // Controles
        this.elements.crossfader = document.getElementById('crossfader');
        this.elements.crossfaderCurve = document.getElementById('crossfaderCurve');
        this.elements.tempoControl = document.getElementById('tempoControl');
        this.elements.tempoReset = document.getElementById('tempoReset');
        this.elements.tempoDisplay = document.getElementById('tempoDisplay');

        // EQ
        this.elements.eqLow = document.getElementById('eqLow');
        this.elements.eqMid = document.getElementById('eqMid');
        this.elements.eqHigh = document.getElementById('eqHigh');
        this.elements.killLow = document.getElementById('killLow');
        this.elements.killMid = document.getElementById('killMid');
        this.elements.killHigh = document.getElementById('killHigh');

        // Filtro
        this.elements.filterType = document.getElementById('filterType');
        this.elements.filterFreq = document.getElementById('filterFreq');
        this.elements.filterQ = document.getElementById('filterQ');

        // Efectos
        this.elements.toggleEffects = document.getElementById('toggleEffects');
        this.elements.effectsPanel = document.getElementById('effectsPanel');
        this.elements.reverbMix = document.getElementById('reverbMix');
        this.elements.reverbDecay = document.getElementById('reverbDecay');
        this.elements.delayTime = document.getElementById('delayTime');
        this.elements.delayFeedback = document.getElementById('delayFeedback');
        this.elements.distortionDrive = document.getElementById('distortionDrive');
        this.elements.phaserRate = document.getElementById('phaserRate');

        // Transporte
        this.elements.playBtn = document.getElementById('playBtn');
        this.elements.pauseBtn = document.getElementById('pauseBtn');
        this.elements.stopBtn = document.getElementById('stopBtn');
        this.elements.prevTrackBtn = document.getElementById('prevTrackBtn');
        this.elements.nextTrackBtn = document.getElementById('nextTrackBtn');

        // Canvas contexts
        this.waveformCtx = this.elements.mainWaveform.getContext('2d');
        this.spectrumCtx = this.elements.spectrumViz.getContext('2d');
        this.circularCtx = this.elements.circularBPM.getContext('2d');
    }

    applyTechnoStyling() {
        const style = document.createElement('style');
        style.textContent = `
            /* 🎛️ DJ CONSOLE TECHNO CONTEMPORÁNEO */
            .dj-console {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 25%, #0d1b2a 50%, #1b263b 75%, #0a0a0a 100%);
                border: 2px solid #00ffff;
                border-radius: 15px;
                padding: 20px;
                z-index: 999;
                box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
                font-family: 'Courier New', monospace;
                color: #00ffff;
                backdrop-filter: blur(20px);
            }

            .console-screen {
                margin-bottom: 20px;
            }

            .oled-display {
                background: linear-gradient(135deg, #000000, #111111);
                border: 1px solid #00ffff;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.1);
                text-align: center;
            }

            .track-info {
                margin-bottom: 10px;
            }

            .track-name {
                font-size: 1.2em;
                font-weight: bold;
                color: #00ffff;
                text-shadow: 0 0 10px #00ffff;
                display: block;
            }

            .track-artist {
                font-size: 0.9em;
                color: #ff00ff;
                opacity: 0.8;
                display: block;
            }

            .bpm-display {
                font-size: 0.8em;
                color: #ffff00;
                display: block;
            }

            .time-display {
                display: flex;
                justify-content: space-between;
                font-size: 0.9em;
                color: #00ff00;
            }

            .waveform-container {
                position: relative;
                background: #000;
                border: 1px solid #00ffff;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 10px;
            }

            .waveform-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
            }

            .cue-points {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }

            .cue-point {
                position: absolute;
                width: 2px;
                height: 100%;
                background: #ff00ff;
                box-shadow: 0 0 5px #ff00ff;
                cursor: pointer;
                pointer-events: auto;
            }

            .playhead {
                position: absolute;
                width: 2px;
                height: 100%;
                background: #00ff00;
                box-shadow: 0 0 10px #00ff00;
                top: 0;
            }

            .visualizers {
                display: flex;
                gap: 10px;
                justify-content: center;
            }

            .console-controls {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }

            .mixer-section, .eq-section, .filter-section, .cues-section {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 8px;
                padding: 15px;
            }

            .crossfader-container, .tempo-container {
                margin-bottom: 15px;
            }

            .crossfader-container input, .tempo-container input {
                width: 100%;
                margin: 5px 0;
            }

            .eq-band {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }

            .eq-band input {
                writing-mode: bt-lr;
                width: 30px;
                height: 100px;
            }

            .kill-btn {
                background: #ff0000;
                color: white;
                border: none;
                padding: 2px 5px;
                border-radius: 3px;
                font-size: 0.7em;
                cursor: pointer;
            }

            .kill-btn.active {
                background: #00ff00;
            }

            .filter-section select, .filter-section input {
                margin: 5px;
            }

            .cue-buttons {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 5px;
                margin-bottom: 10px;
            }

            .cue-btn {
                background: rgba(255, 0, 255, 0.2);
                border: 1px solid #ff00ff;
                color: #ff00ff;
                padding: 5px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 0.8em;
            }

            .cue-btn.active {
                background: #ff00ff;
                color: white;
            }

            .loop-controls {
                display: flex;
                gap: 5px;
                justify-content: center;
            }

            .loop-controls button {
                background: rgba(255, 255, 0, 0.2);
                border: 1px solid #ffff00;
                color: #ffff00;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
            }

            .effects-panel {
                margin-bottom: 20px;
            }

            .effects-toggle {
                background: linear-gradient(135deg, #ff00ff, #00ffff);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                width: 100%;
            }

            .effects-controls {
                display: none;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }

            .effects-controls.active {
                display: grid;
            }

            .effect-control {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 5px;
                padding: 10px;
                text-align: center;
            }

            .effect-control label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }

            .effect-control input {
                width: 100%;
            }

            .transport-controls {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 15px;
            }

            .transport-btn {
                background: rgba(0, 255, 0, 0.2);
                border: 1px solid #00ff00;
                color: #00ff00;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1.2em;
            }

            .transport-btn:hover {
                background: rgba(0, 255, 0, 0.4);
            }

            /* 🎨 ANIMACIONES TECHNO */
            @keyframes neonGlow {
                0%, 100% { box-shadow: 0 0 5px #00ffff; }
                50% { box-shadow: 0 0 20px #00ffff, 0 0 30px #00ffff; }
            }

            .dj-console {
                animation: neonGlow 3s ease-in-out infinite;
            }

            /* 📱 RESPONSIVE PARA MÓVILES */
            @media (max-width: 768px) {
                .dj-console {
                    bottom: 10px;
                    left: 10px;
                    right: 10px;
                    padding: 15px;
                }

                .console-controls {
                    grid-template-columns: 1fr;
                    gap: 10px;
                }

                .waveform-container {
                    height: 80px;
                }

                .visualizers {
                    flex-direction: column;
                    align-items: center;
                }

                .transport-controls {
                    flex-wrap: wrap;
                }

                .transport-btn {
                    padding: 8px 12px;
                    font-size: 1em;
                }
            }
        `;
        document.head.appendChild(style);
    }

    async setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Crear nodos de audio
            this.analyser = this.audioContext.createAnalyser();
            this.gainNode = this.audioContext.createGain();
            this.biquadFilter = this.audioContext.createBiquadFilter();

            // Configurar analyser
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            // Configurar conexiones
            this.source = this.audioContext.createBufferSource();
            this.source.connect(this.biquadFilter);
            this.biquadFilter.connect(this.gainNode);
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Configurar efectos
            this.setupEffects();

            console.log('🎵 AudioContext configurado para DJ Console');
        } catch (error) {
            console.error('❌ Error configurando AudioContext:', error);
        }
    }

    setupEffects() {
        // Reverb
        this.convolver = this.audioContext.createConvolver();
        this.createReverbImpulse();

        // Delay
        this.delayNode = this.audioContext.createDelay(2);
        this.delayNode.delayTime.value = 0.5;
        const delayFeedback = this.audioContext.createGain();
        delayFeedback.gain.value = 0.3;
        this.delayNode.connect(delayFeedback);
        delayFeedback.connect(this.delayNode);

        // Distortion
        this.distortion = this.audioContext.createWaveShaper();
        this.distortion.curve = this.makeDistortionCurve(0);

        // Phaser (usando filtro)
        this.phaser = this.audioContext.createBiquadFilter();
        this.phaser.type = 'notch';
        this.phaser.frequency.value = 1000;
        this.phaser.Q.value = 10;
    }

    setupEventListeners() {
        // Controles de transporte
        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        this.elements.prevTrackBtn.addEventListener('click', () => this.prevTrack());
        this.elements.nextTrackBtn.addEventListener('click', () => this.nextTrack());

        // Crossfader y tempo
        this.elements.crossfader.addEventListener('input', (e) => {
            this.crossfader = parseFloat(e.target.value);
            this.updateCrossfader();
        });

        this.elements.crossfaderCurve.addEventListener('input', (e) => {
            this.crossfaderCurve = parseFloat(e.target.value);
        });

        this.elements.tempoControl.addEventListener('input', (e) => {
            this.tempo = parseFloat(e.target.value);
            this.updateTempo();
        });

        this.elements.tempoReset.addEventListener('click', () => {
            this.tempo = 1.0;
            this.elements.tempoControl.value = 1.0;
            this.updateTempo();
        });

        // EQ
        this.elements.eqLow.addEventListener('input', (e) => {
            this.eq.low = parseFloat(e.target.value);
            this.updateEQ();
        });

        this.elements.eqMid.addEventListener('input', (e) => {
            this.eq.mid = parseFloat(e.target.value);
            this.updateEQ();
        });

        this.elements.eqHigh.addEventListener('input', (e) => {
            this.eq.high = parseFloat(e.target.value);
            this.updateEQ();
        });

        // Kill switches
        this.elements.killLow.addEventListener('click', () => this.toggleKill('low'));
        this.elements.killMid.addEventListener('click', () => this.toggleKill('mid'));
        this.elements.killHigh.addEventListener('click', () => this.toggleKill('high'));

        // Filtro
        this.elements.filterType.addEventListener('change', (e) => {
            this.filter.type = e.target.value;
            this.updateFilter();
        });

        this.elements.filterFreq.addEventListener('input', (e) => {
            this.filter.frequency = parseFloat(e.target.value);
            this.updateFilter();
        });

        this.elements.filterQ.addEventListener('input', (e) => {
            this.filter.Q = parseFloat(e.target.value);
            this.updateFilter();
        });

        // Hot Cues
        document.querySelectorAll('.cue-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => this.setCuePoint(index));
        });

        // Loop controls
        document.getElementById('setLoopIn').addEventListener('click', () => this.setLoopIn());
        document.getElementById('setLoopOut').addEventListener('click', () => this.setLoopOut());
        document.getElementById('toggleLoop').addEventListener('click', () => this.toggleLoop());

        // Efectos
        this.elements.toggleEffects.addEventListener('click', () => this.toggleEffectsPanel());

        this.elements.reverbMix.addEventListener('input', (e) => {
            this.effects.reverb.mix = parseFloat(e.target.value);
            this.updateReverb();
        });

        this.elements.reverbDecay.addEventListener('input', (e) => {
            this.effects.reverb.decay = parseFloat(e.target.value);
            this.updateReverb();
        });

        this.elements.delayTime.addEventListener('input', (e) => {
            this.effects.delay.time = parseFloat(e.target.value);
            this.updateDelay();
        });

        this.elements.delayFeedback.addEventListener('input', (e) => {
            this.effects.delay.feedback = parseFloat(e.target.value);
            this.updateDelay();
        });

        this.elements.distortionDrive.addEventListener('input', (e) => {
            this.effects.distortion.drive = parseFloat(e.target.value);
            this.updateDistortion();
        });

        this.elements.phaserRate.addEventListener('input', (e) => {
            this.effects.phaser.rate = parseFloat(e.target.value);
            this.updatePhaser();
        });

        // Waveform interaction
        this.elements.mainWaveform.addEventListener('click', (e) => this.scrubToPosition(e));

        // BPM detection
        this.detectBPM();

        // Visual updates
        this.startVisualization();
    }

    async loadDefaultTrack() {
        try {
            const response = await fetch('/Music/track1.mp3');
            const arrayBuffer = await response.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            this.elements.trackName.textContent = '🎵 4 - dR.iAn';
            this.elements.trackArtist.textContent = 'TECHNO TRACK';
            this.duration = this.audioBuffer.duration;
            this.updateTimeDisplay();

            console.log('🎵 Track cargado en DJ Console');
        } catch (error) {
            console.error('❌ Error cargando track:', error);
        }
    }

    play() {
        if (!this.audioBuffer) return;

        if (this.source) {
            this.source.stop();
        }

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.playbackRate.value = this.tempo;

        // Reconectar con efectos
        this.reconnectAudioGraph();

        this.source.start(0, this.currentTime);
        this.isPlaying = true;

        this.startTime = this.audioContext.currentTime - this.currentTime;
        this.updatePlayhead();

        console.log('▶️ Reproducción iniciada en DJ Console');
    }

    pause() {
        if (this.source) {
            this.source.stop();
            this.currentTime = this.audioContext.currentTime - this.startTime;
        }
        this.isPlaying = false;
        console.log('⏸️ Reproducción pausada');
    }

    stop() {
        this.pause();
        this.currentTime = 0;
        this.updatePlayhead();
        console.log('⏹️ Reproducción detenida');
    }

    nextTrack() {
        // Implementar cambio de track
        console.log('⏭️ Siguiente track');
    }

    prevTrack() {
        // Implementar cambio de track
        console.log('⏮️ Track anterior');
    }

    updateCrossfader() {
        // Implementar crossfader con curva ajustable
        const curve = Math.pow(this.crossfader, this.crossfaderCurve);
        this.gainNode.gain.value = curve * this.volume;
    }

    updateTempo() {
        if (this.source) {
            this.source.playbackRate.value = this.tempo;
        }
        this.elements.tempoDisplay.textContent = Math.round(this.tempo * 100) + '%';
    }

    updateEQ() {
        // Implementar EQ 3-bandas
        console.log('🎚️ EQ actualizado:', this.eq);
    }

    toggleKill(band) {
        this.killSwitches[band] = !this.killSwitches[band];
        const btn = this.elements[`kill${band.charAt(0).toUpperCase() + band.slice(1)}`];
        btn.classList.toggle('active', this.killSwitches[band]);

        if (this.killSwitches[band]) {
            // Aplicar kill (ganancia muy baja)
            this.eq[band] = -60;
        } else {
            // Reset a 0
            this.eq[band] = 0;
        }
        this.updateEQ();
    }

    updateFilter() {
        if (this.filter.type === 'off') {
            // Bypass filter
            this.biquadFilter.frequency.value = 20000;
            this.biquadFilter.Q.value = 0.1;
        } else {
            this.biquadFilter.type = this.filter.type;
            this.biquadFilter.frequency.value = this.filter.frequency;
            this.biquadFilter.Q.value = this.filter.Q;
        }
    }

    setCuePoint(index) {
        if (!this.isPlaying) return;

        this.cuePoints[index] = this.currentTime;
        this.updateCuePoints();
        console.log(`🎯 Cue point ${index + 1} establecido en ${this.currentTime}s`);
    }

    setLoopIn() {
        this.loopRegion.start = this.currentTime;
        this.updateLoopRegion();
        console.log('🔄 Loop IN establecido');
    }

    setLoopOut() {
        this.loopRegion.end = this.currentTime;
        this.updateLoopRegion();
        console.log('🔄 Loop OUT establecido');
    }

    toggleLoop() {
        this.loopRegion.active = !this.loopRegion.active;
        document.getElementById('toggleLoop').classList.toggle('active', this.loopRegion.active);
        console.log('🔄 Loop', this.loopRegion.active ? 'activado' : 'desactivado');
    }

    toggleEffectsPanel() {
        const controls = this.elements.effectsPanel.querySelector('.effects-controls');
        controls.classList.toggle('active');
    }

    updateReverb() {
        // Implementar reverb
        console.log('🌊 Reverb actualizado:', this.effects.reverb);
    }

    updateDelay() {
        if (this.delayNode) {
            this.delayNode.delayTime.value = this.effects.delay.time;
            // Actualizar feedback
        }
        console.log('⏰ Delay actualizado:', this.effects.delay);
    }

    updateDistortion() {
        if (this.distortion) {
            this.distortion.curve = this.makeDistortionCurve(this.effects.distortion.drive);
        }
        console.log('🔊 Distortion actualizado:', this.effects.distortion);
    }

    updatePhaser() {
        if (this.phaser) {
            // Implementar LFO para phaser
            const now = this.audioContext.currentTime;
            this.phaser.frequency.setValueAtTime(
                1000 + Math.sin(now * this.effects.phaser.rate * 2 * Math.PI) * 500,
                now
            );
        }
        console.log('🌈 Phaser actualizado:', this.effects.phaser);
    }

    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    scrubToPosition(event) {
        const rect = this.elements.mainWaveform.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const ratio = x / rect.width;
        this.currentTime = ratio * this.duration;
        this.updatePlayhead();

        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }

    detectBPM() {
        // Implementar detección de BPM básica
        this.bpm = 128; // Placeholder
        this.elements.bpmDisplay.textContent = `BPM: ${this.bpm}`;
    }

    reconnectAudioGraph() {
        // Reconectar el source con todos los efectos
        this.source.disconnect();

        let lastNode = this.source;

        // Filtro
        if (this.filter.type !== 'off') {
            lastNode.connect(this.biquadFilter);
            lastNode = this.biquadFilter;
        }

        // Efectos
        if (this.effects.reverb.mix > 0) {
            const reverbGain = this.audioContext.createGain();
            reverbGain.gain.value = this.effects.reverb.mix;
            lastNode.connect(reverbGain);
            reverbGain.connect(this.convolver);
            lastNode.connect(this.gainNode);
            this.convolver.connect(this.gainNode);
        }

        if (this.effects.delay.time > 0) {
            lastNode.connect(this.delayNode);
            this.delayNode.connect(this.gainNode);
        }

        if (this.effects.distortion.drive > 0) {
            lastNode.connect(this.distortion);
            this.distortion.connect(this.gainNode);
        }

        if (this.effects.phaser.rate > 0) {
            lastNode.connect(this.phaser);
            this.phaser.connect(this.gainNode);
        }

        // Conectar a analyser y output
        lastNode.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }

    startVisualization() {
        const animate = () => {
            requestAnimationFrame(animate);

            if (this.isPlaying) {
                this.updatePlayhead();
                this.updateTimeDisplay();
            }

            // 🆕 Verificar que los métodos existen antes de llamarlos
            if (typeof this.drawSpectrum === 'function') {
                this.drawSpectrum();
            }
            if (typeof this.drawCircularBPM === 'function') {
                this.drawCircularBPM();
            }
        };

        animate();
    }

    // 🆕 AGREGAR MÉTODOS FALTANTES PARA EVITAR ERRORES
    drawSpectrum() {
        if (!this.analyser || !this.spectrumCtx) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        const canvas = this.elements.spectrumViz;
        const ctx = this.spectrumCtx;
        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * height;

            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(1, '#ff00ff');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    drawCircularBPM() {
        if (!this.circularCtx) return;

        const canvas = this.elements.circularBPM;
        const ctx = this.circularCtx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 5;

        // Limpiar canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar círculo base
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();

        // Dibujar BPM visual
        const bpmAngle = (this.bpm / 200) * 2 * Math.PI; // Normalizar BPM
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 5, -Math.PI / 2, bpmAngle - Math.PI / 2);
        ctx.stroke();

        // Texto BPM
        ctx.fillStyle = '#ffff00';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.bpm.toString(), centerX, centerY + 4);
    }

    // 🆕 AGREGAR MÉTODOS FALTANTES PARA CUE POINTS Y LOOP
    updateCuePoints() {
        if (!this.elements.cuePoints) return;

        // Limpiar cue points existentes
        this.elements.cuePoints.innerHTML = '';

        // Dibujar cue points
        this.cuePoints.forEach((time, index) => {
            if (time !== null && this.duration > 0) {
                const ratio = time / this.duration;
                const canvasWidth = this.elements.mainWaveform.width;
                const left = ratio * canvasWidth;

                const cueElement = document.createElement('div');
                cueElement.className = 'cue-point';
                cueElement.style.left = left + 'px';
                cueElement.title = `Cue ${index + 1}: ${this.formatTime(time)}`;
                cueElement.addEventListener('click', () => {
                    this.currentTime = time;
                    this.updatePlayhead();
                    if (this.isPlaying) {
                        this.pause();
                        this.play();
                    }
                });

                this.elements.cuePoints.appendChild(cueElement);
            }
        });
    }

    updateLoopRegion() {
        if (!this.elements.loopRegion) return;

        // Limpiar loop region existente
        this.elements.loopRegion.innerHTML = '';

        if (this.loopRegion.start !== null && this.loopRegion.end !== null && this.duration > 0) {
            const startRatio = this.loopRegion.start / this.duration;
            const endRatio = this.loopRegion.end / this.duration;
            const canvasWidth = this.elements.mainWaveform.width;

            const loopElement = document.createElement('div');
            loopElement.className = 'loop-region-active';
            loopElement.style.left = (startRatio * canvasWidth) + 'px';
            loopElement.style.width = ((endRatio - startRatio) * canvasWidth) + 'px';
            loopElement.style.height = '100%';
            loopElement.style.background = 'rgba(255, 255, 0, 0.3)';
            loopElement.style.borderLeft = '2px solid #ffff00';
            loopElement.style.borderRight = '2px solid #ffff00';
            loopElement.style.position = 'absolute';
            loopElement.style.top = '0';
            loopElement.style.pointerEvents = 'none';

            this.elements.loopRegion.appendChild(loopElement);
        }
    }

    // 🆕 AGREGAR MÉTODO PARA CREAR IMPULSE RESPONSE PARA REVERB
    createReverbImpulse() {
        if (!this.audioContext) return;

        const length = this.audioContext.sampleRate * this.effects.reverb.decay;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, this.effects.reverb.decay);
            }
        }

        if (this.convolver) {
            this.convolver.buffer = impulse;
        }
    }

    updatePlayhead() {
        if (!this.isPlaying) return;

        this.currentTime = this.audioContext.currentTime - this.startTime;
        if (this.currentTime >= this.duration) {
            this.currentTime = 0;
            this.stop();
            return;
        }

        const ratio = this.currentTime / this.duration;
        const canvasWidth = this.elements.mainWaveform.width;
        this.elements.playhead.style.left = (ratio * canvasWidth) + 'px';
    }

    updateTimeDisplay() {
        const current = this.formatTime(this.currentTime);
        const total = this.formatTime(this.duration);

        this.elements.currentTime.textContent = current;
        this.elements.totalTime.textContent = total;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
