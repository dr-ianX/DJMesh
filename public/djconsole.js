// 🎛️ DJ CONSOLE PROFESIONAL - VERSIÓN MEJORADA
// Consola de DJ optimizada para DJMesh

class DJConsole {
    constructor() {
        // Inicializar propiedades básicas
        this.audioContext = null;
        
        // 🆕 Audio Node Pooling System
        this.nodePool = {
            gainNodes: [],
            analysers: [],
            bufferSources: []
        };
        
        // Animation frame tracking
        this.animationFrames = {
            A: null,
            B: null
        };

        // 🆕 Keyboard shortcuts system
        this.activeDeck = 'A'; // Deck activo para atajos
        this.setupKeyboardShortcuts();
        
        // Deck A
        this.deckA = {
            audioBuffer: null,
            source: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 0.8,
            bpm: 128,
            currentTrack: null,
            analyser: null,
            gainNode: null,
            crossfaderGain: null,
            eq: {
                low: 0,
                mid: 0,
                high: 0
            },
            eqFilters: {
                low: null,
                mid: null,
                high: null
            },
            killSwitches: {
                low: false,
                mid: false,
                high: false
            },
            tempo: 1.0,
            cuePoints: [null, null, null, null],
            hotCues: [null, null, null, null],
            zoom: {
                level: 1,
                offset: 0,
                maxZoom: 16,
                minZoom: 1
            },
            // 🆕 Drag properties
            drag: {
                isDragging: false,
                startX: 0,
                startOffset: 0
            }
        };
        
        // Deck B
        this.deckB = {
            audioBuffer: null,
            source: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 0.8,
            bpm: 128,
            currentTrack: null,
            analyser: null,
            gainNode: null,
            crossfaderGain: null,
            eq: { 
                low: 0, 
                mid: 0, 
                high: 0 
            },
            eqFilters: {
                low: null,
                mid: null,
                high: null
            },
            killSwitches: {
                low: false,
                mid: false,
                high: false
            },
            tempo: 1.0,
            cuePoints: [null, null, null, null],
            hotCues: [null, null, null, null],
            zoom: {
                level: 1,
                offset: 0,
                maxZoom: 16,
                minZoom: 1
            },
            // 🆕 Drag properties
            drag: {
                isDragging: false,
                startX: 0,
                startOffset: 0
            }
        };
        
        // Master controls
        this.crossfader = 0.5;
        this.crossfaderCurve = 'linear'; // Default curve
        this.masterVolume = 0.8;
        this.masterBpm = 128;

        // Efectos y controles
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
        this.tempoRange = { min: 0.5, max: 2.0 };
        this.cuePoints = [null, null, null, null];
        this.loopRegion = { start: 0, end: 0, active: false };

        // Beat matching
        this.beatMatching = {
            enabled: true,
            tolerance: 0.05, // 5% tolerance
            lastBeatA: 0,
            lastBeatB: 0,
            beatIntervalA: 0,
            beatIntervalB: 0,
            beatTimerA: null,
            beatTimerB: null
        };

        // Cache de elementos DOM
        this.elements = {};
        this.waveformCtxA = null;
        this.waveformCtxB = null;
    }

    // 🆕 AUDIO NODE POOLING METHODS
    getGainNode() {
        return this.nodePool.gainNodes.pop() || this.audioContext.createGain();
    }
    
    returnGainNode(node) {
        if (node) {
            try {
                node.disconnect();
                node.gain.value = 1; // Reset to default
                this.nodePool.gainNodes.push(node);
            } catch (e) {
                // Node already disconnected or invalid
                console.log('🔄 Gain node no válido para pooling');
            }
        }
    }
    
    getAnalyser() {
        return this.nodePool.analysers.pop() || this.audioContext.createAnalyser();
    }
    
    returnAnalyser(node) {
        if (node) {
            try {
                node.disconnect();
                this.nodePool.analysers.push(node);
            } catch (e) {
                console.log('🔄 Analyser node no válido para pooling');
            }
        }
    }
    
    getBufferSource() {
        return this.nodePool.bufferSources.pop() || this.audioContext.createBufferSource();
    }
    
    returnBufferSource(node) {
        if (node) {
            try {
                node.disconnect();
                this.nodePool.bufferSources.push(node);
            } catch (e) {
                // BufferSources no se pueden reutilizar después de stop()
                console.log('🔄 BufferSource no se puede reutilizar');
            }
        }
    }

    // 🆕 CREAR ESTRUCTURA HTML PARA 2 DECKS
    createConsole() {
        const container = document.getElementById('dj-console');
        if (!container) {
            console.error('❌ No se encontró el contenedor #dj-console');
            return;
        }

        container.innerHTML = `
            <div class="dj-mixer-container">
                <!-- Deck A -->
                <div class="deck deck-a">
                    <div class="deck-header">
                        <h3>DECK A</h3>
                        <div class="deck-status-led" id="deckALed">
                            <div class="led-indicator" id="deckALedIndicator"></div>
                            <div class="deck-status" id="deckAStatus">STOPPED</div>
                        </div>
                    </div>
                    
                    <div class="track-info">
                        <div class="track-name" id="trackNameA">No Track Loaded</div>
                        <div class="track-artist" id="trackArtistA">--- BPM</div>
                        <div class="time-display">
                            <span id="currentTimeA">00:00</span> / <span id="totalTimeA">00:00</span>
                        </div>
                    </div>

                    <div class="waveform-container">
                        <canvas id="waveformA" width="400" height="150"></canvas>
                        <div class="playhead" id="playheadA"></div>
                        <div class="waveform-controls">
                            <button id="zoomInA" class="zoom-btn">🔍+</button>
                            <button id="zoomOutA" class="zoom-btn">🔍-</button>
                            <button id="zoomResetA" class="zoom-btn">⟲</button>
                            <div class="zoom-level" id="zoomLevelA">1x</div>
                        </div>
                    </div>

                    <div class="vu-meter-container">
                        <div class="vu-meter-label">VU</div>
                        <div class="vu-meter" id="vuMeterA">
                            <div class="vu-meter-bar" id="vuMeterBarA"></div>
                        </div>
                    </div>

                    <div class="transport-controls">
                        <button id="cueA" class="btn-cue">CUE</button>
                        <button id="playA" class="btn-play">▶</button>
                        <button id="pauseA" class="btn-pause">⏸</button>
                        <button id="stopA" class="btn-stop">⏹</button>
                    </div>

                    <div class="eq-section">
                        <div class="eq-band">
                            <label>LOW</label>
                            <input type="range" id="eqLowA" min="-20" max="20" value="0" class="eq-slider">
                            <span id="eqLowValueA">0</span>
                            <button id="killLowA" class="kill-switch">KILL</button>
                        </div>
                        <div class="eq-band">
                            <label>MID</label>
                            <input type="range" id="eqMidA" min="-20" max="20" value="0" class="eq-slider">
                            <span id="eqMidValueA">0</span>
                            <button id="killMidA" class="kill-switch">KILL</button>
                        </div>
                        <div class="eq-band">
                            <label>HIGH</label>
                            <input type="range" id="eqHighA" min="-20" max="20" value="0" class="eq-slider">
                            <span id="eqHighValueA">0</span>
                            <button id="killHighA" class="kill-switch">KILL</button>
                        </div>
                        <!-- 🆕 EQ Visualization Canvas -->
                        <canvas id="eqVisualizerA" width="280" height="80" class="eq-visualizer"></canvas>
                    </div>

                    <div class="tempo-section">
                        <label>TEMPO: <span id="tempoDisplayA">100%</span></label>
                        <input type="range" id="tempoA" min="50" max="200" value="100" class="tempo-slider">
                    </div>
                    
                    <div class="volume-section">
                        <label>VOLUME: <span id="volumeDisplayA">80%</span></label>
                        <input type="range" id="volumeA" min="0" max="100" value="80" class="volume-slider">
                    </div>

                    <div class="cue-points">
                        <button id="cue1A" class="btn-cue-point">CUE1</button>
                        <button id="cue2A" class="btn-cue-point">CUE2</button>
                        <button id="cue3A" class="btn-cue-point">CUE3</button>
                        <button id="cue4A" class="btn-cue-point">CUE4</button>
                    </div>

                    <div class="track-selector">
                        <select id="trackSelectA">
                            <option value="">Select Track</option>
                            <option value="track1">4 - dR.iAn</option>
                            <option value="mereconozco">Me Reconozco</option>
                            <option value="mariutodalanoche">Toda La Noche</option>
                            <option value="acontratiempo">A Contratiempo</option>
                        </select>
                        <button id="loadTrackA" class="btn-load">LOAD</button>
                    </div>
                </div>

                <!-- Sección Central (Crossfader y Master) -->
                <div class="mixer-section">
                    <div class="crossfader-section">
                        <label>CROSSFADER</label>
                        <input type="range" id="crossfader" min="0" max="100" value="50" class="crossfader-slider">
                        <div class="crossfader-labels">
                            <span>A</span>
                            <span>MIX</span>
                            <span>B</span>
                        </div>
                        <div class="crossfader-curve-section">
                            <label>CURVE</label>
                            <select id="crossfaderCurve" class="crossfader-curve-select">
                                <option value="linear">Linear</option>
                                <option value="power">Power</option>
                                <option value="cut">Cut</option>
                                <option value="smooth">Smooth</option>
                            </select>
                            <canvas id="curvePreview" width="120" height="60" class="curve-preview"></canvas>
                        </div>
                    </div>

                    <div class="bpm-sync-section">
                        <label>BPM SYNC</label>
                        <div class="sync-buttons">
                            <button id="syncAtoB" class="btn-sync">A → B</button>
                            <button id="syncBtoA" class="btn-sync">B → A</button>
                        </div>
                        <div class="bpm-display" id="bpmSyncDisplay">BPM: 128</div>
                    </div>

                    <div class="master-section">
                        <div class="master-bpm" id="masterBpm">MASTER BPM: 128</div>
                        <div class="master-volume">
                            <label>MASTER</label>
                            <input type="range" id="masterVolume" min="0" max="100" value="80" class="volume-slider">
                            <span id="masterVolumeDisplay">80%</span>
                        </div>
                    </div>

                    <div class="vu-meters">
                        <div class="vu-meter" id="vuMeterA">
                            <div class="vu-bar"></div>
                        </div>
                        <div class="vu-meter" id="vuMeterB">
                            <div class="vu-bar"></div>
                        </div>
                    </div>

                    <div class="beat-matching-section">
                        <label>BEAT MATCHING</label>
                        <div class="beat-indicators">
                            <div class="beat-indicator" id="beatIndicatorA">
                                <div class="beat-light"></div>
                                <span>DECK A</span>
                            </div>
                            <div class="beat-indicator" id="beatIndicatorB">
                                <div class="beat-light"></div>
                                <span>DECK B</span>
                            </div>
                        </div>
                        <div class="sync-status" id="syncStatus">NO SYNC</div>
                    </div>
                </div>

                <!-- Deck B -->
                <div class="deck deck-b">
                    <div class="deck-header">
                        <h3>DECK B</h3>
                        <div class="deck-status-led" id="deckBLed">
                            <div class="led-indicator" id="deckBLedIndicator"></div>
                            <div class="deck-status" id="deckBStatus">STOPPED</div>
                        </div>
                    </div>
                    
                    <div class="track-info">
                        <div class="track-name" id="trackNameB">No Track Loaded</div>
                        <div class="track-artist" id="trackArtistB">--- BPM</div>
                        <div class="time-display">
                            <span id="currentTimeB">00:00</span> / <span id="totalTimeB">00:00</span>
                        </div>
                    </div>

                    <div class="waveform-container">
                        <canvas id="waveformB" width="400" height="150"></canvas>
                        <div class="playhead" id="playheadB"></div>
                        <div class="waveform-controls">
                            <button id="zoomInB" class="zoom-btn">🔍+</button>
                            <button id="zoomOutB" class="zoom-btn">🔍-</button>
                            <button id="zoomResetB" class="zoom-btn">⟲</button>
                            <div class="zoom-level" id="zoomLevelB">1x</div>
                        </div>
                    </div>

                    <div class="vu-meter-container">
                        <div class="vu-meter-label">VU</div>
                        <div class="vu-meter" id="vuMeterB">
                            <div class="vu-meter-bar" id="vuMeterBarB"></div>
                        </div>
                    </div>

                    <div class="transport-controls">
                        <button id="cueB" class="btn-cue">CUE</button>
                        <button id="playB" class="btn-play">▶</button>
                        <button id="pauseB" class="btn-pause">⏸</button>
                        <button id="stopB" class="btn-stop">⏹</button>
                    </div>

                    <div class="eq-section">
                        <div class="eq-band">
                            <label>LOW</label>
                            <input type="range" id="eqLowB" min="-20" max="20" value="0" class="eq-slider">
                            <span id="eqLowValueB">0</span>
                            <button id="killLowB" class="kill-switch">KILL</button>
                        </div>
                        <div class="eq-band">
                            <label>MID</label>
                            <input type="range" id="eqMidB" min="-20" max="20" value="0" class="eq-slider">
                            <span id="eqMidValueB">0</span>
                            <button id="killMidB" class="kill-switch">KILL</button>
                        </div>
                        <div class="eq-band">
                            <label>HIGH</label>
                            <input type="range" id="eqHighB" min="-20" max="20" value="0" class="eq-slider">
                            <span id="eqHighValueB">0</span>
                            <button id="killHighB" class="kill-switch">KILL</button>
                        </div>
                        <!-- 🆕 EQ Visualization Canvas -->
                        <canvas id="eqVisualizerB" width="280" height="80" class="eq-visualizer"></canvas>
                    </div>

                    <div class="tempo-section">
                        <label>TEMPO: <span id="tempoDisplayB">100%</span></label>
                        <input type="range" id="tempoB" min="50" max="200" value="100" class="tempo-slider">
                    </div>
                    
                    <div class="volume-section">
                        <label>VOLUME: <span id="volumeDisplayB">80%</span></label>
                        <input type="range" id="volumeB" min="0" max="100" value="80" class="volume-slider">
                    </div>

                    <div class="cue-points">
                        <button id="cue1B" class="btn-cue-point">CUE1</button>
                        <button id="cue2B" class="btn-cue-point">CUE2</button>
                        <button id="cue3B" class="btn-cue-point">CUE3</button>
                        <button id="cue4B" class="btn-cue-point">CUE4</button>
                    </div>

                    <div class="track-selector">
                        <select id="trackSelectB">
                            <option value="">Select Track</option>
                            <option value="track1">4 - dR.iAn</option>
                            <option value="mereconozco">Me Reconozco</option>
                            <option value="mariutodalanoche">Toda La Noche</option>
                            <option value="acontratiempo">A Contratiempo</option>
                        </select>
                        <button id="loadTrackB" class="btn-load">LOAD</button>
                    </div>
                </div>
            </div>
        `;

        console.log('✅ Estructura HTML de 2 decks creada');
    }

    // 🆕 CACHE DE ELEMENTOS PARA 2 DECKS
    cacheElements() {
        // Deck A
        this.elements.trackNameA = document.getElementById('trackNameA');
        this.elements.trackArtistA = document.getElementById('trackArtistA');
        this.elements.currentTimeA = document.getElementById('currentTimeA');
        this.elements.totalTimeA = document.getElementById('totalTimeA');
        this.elements.deckAStatus = document.getElementById('deckAStatus');
        this.elements.waveformA = document.getElementById('waveformA');
        this.elements.playheadA = document.getElementById('playheadA');
        this.elements.zoomInA = document.getElementById('zoomInA');
        this.elements.zoomOutA = document.getElementById('zoomOutA');
        this.elements.zoomResetA = document.getElementById('zoomResetA');
        this.elements.zoomLevelA = document.getElementById('zoomLevelA');
        this.elements.eqLowA = document.getElementById('eqLowA');
        this.elements.eqMidA = document.getElementById('eqMidA');
        this.elements.eqHighA = document.getElementById('eqHighA');
        this.elements.eqVisualizerA = document.getElementById('eqVisualizerA');
        
        // 🆕 Kill Switches Deck A
        this.elements.killLowA = document.getElementById('killLowA');
        this.elements.killMidA = document.getElementById('killMidA');
        this.elements.killHighA = document.getElementById('killHighA');
        this.elements.tempoA = document.getElementById('tempoA');
        this.elements.tempoDisplayA = document.getElementById('tempoDisplayA');
        this.elements.volumeA = document.getElementById('volumeA');
        this.elements.volumeDisplayA = document.getElementById('volumeDisplayA');
        this.elements.trackSelectA = document.getElementById('trackSelectA');
        this.elements.loadTrackA = document.getElementById('loadTrackA');
        
        // 🆕 Hot Cues Deck A
        this.elements.cue1A = document.getElementById('cue1A');
        this.elements.cue2A = document.getElementById('cue2A');
        this.elements.cue3A = document.getElementById('cue3A');
        this.elements.cue4A = document.getElementById('cue4A');
        
        // Deck A Status
        this.elements.deckAStatus = document.getElementById('deckAStatus');
        this.elements.deckALedIndicator = document.getElementById('deckALedIndicator');
        
        // VU Meters
        this.elements.vuMeterA = document.getElementById('vuMeterA');
        this.elements.stopA = document.getElementById('stopA');
        this.elements.cueA = document.getElementById('cueA');

        // Deck B
        this.elements.trackNameB = document.getElementById('trackNameB');
        this.elements.trackArtistB = document.getElementById('trackArtistB');
        this.elements.currentTimeB = document.getElementById('currentTimeB');
        this.elements.totalTimeB = document.getElementById('totalTimeB');
        this.elements.deckBStatus = document.getElementById('deckBStatus');
        this.elements.waveformB = document.getElementById('waveformB');
        this.elements.playheadB = document.getElementById('playheadB');
        this.elements.zoomInB = document.getElementById('zoomInB');
        this.elements.zoomOutB = document.getElementById('zoomOutB');
        this.elements.zoomResetB = document.getElementById('zoomResetB');
        this.elements.zoomLevelB = document.getElementById('zoomLevelB');
        this.elements.eqLowB = document.getElementById('eqLowB');
        this.elements.eqMidB = document.getElementById('eqMidB');
        this.elements.eqHighB = document.getElementById('eqHighB');
        this.elements.eqVisualizerB = document.getElementById('eqVisualizerB');
        
        // 🆕 Kill Switches Deck B
        this.elements.killLowB = document.getElementById('killLowB');
        this.elements.killMidB = document.getElementById('killMidB');
        this.elements.killHighB = document.getElementById('killHighB');
        this.elements.tempoB = document.getElementById('tempoB');
        this.elements.tempoDisplayB = document.getElementById('tempoDisplayB');
        this.elements.volumeB = document.getElementById('volumeB');
        this.elements.volumeDisplayB = document.getElementById('volumeDisplayB');
        this.elements.trackSelectB = document.getElementById('trackSelectB');
        this.elements.loadTrackB = document.getElementById('loadTrackB');
        
        // 🆕 Hot Cues Deck B
        this.elements.cue1B = document.getElementById('cue1B');
        this.elements.cue2B = document.getElementById('cue2B');
        this.elements.cue3B = document.getElementById('cue3B');
        this.elements.cue4B = document.getElementById('cue4B');
        
        // Deck B Status
        this.elements.deckBStatus = document.getElementById('deckBStatus');
        this.elements.deckBLedIndicator = document.getElementById('deckBLedIndicator');
        
        // Transport controls Deck B
        this.elements.playB = document.getElementById('playB');
        this.elements.pauseB = document.getElementById('pauseB');
        this.elements.stopB = document.getElementById('stopB');
        this.elements.cueB = document.getElementById('cueB');

        // Master
        this.elements.crossfader = document.getElementById('crossfader');
        this.elements.crossfaderCurve = document.getElementById('crossfaderCurve');
        this.elements.curvePreview = document.getElementById('curvePreview');
        this.elements.masterVolume = document.getElementById('masterVolume');
        this.elements.masterVolumeDisplay = document.getElementById('masterVolumeDisplay');
        this.elements.masterBpm = document.getElementById('masterBpm');

        console.log('✅ Elementos cacheados para 2 decks');
    }

    // 🆕 ESTILOS TECNO ACTUALIZADOS PARA 2 DECKS
    applyTechnoStyling() {
        const style = document.createElement('style');
        style.textContent = `
            .dj-mixer-container {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                gap: 20px;
                padding: 20px;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%);
                border-radius: 15px;
                min-height: 600px;
                font-family: 'Courier New', monospace;
                color: #00ffff;
                box-shadow: 0 0 30px rgba(0,255,255,0.3);
            }

            .deck {
                background: rgba(0,20,40,0.8);
                border: 2px solid #00ffff;
                border-radius: 10px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                transition: all 0.3s ease;
            }

            .deck.active-deck {
                border-color: #00ff88;
                box-shadow: 0 0 40px rgba(0, 255, 136, 0.5);
                background: rgba(0,40,20,0.9);
            }

            .deck-a {
                border-color: #ff0080;
                box-shadow: 0 0 20px rgba(255,0,128,0.3);
            }

            .deck-b {
                border-color: #00ff80;
                box-shadow: 0 0 20px rgba(0,255,128,0.3);
            }

            .deck-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: rgba(0,0,0,0.5);
                border-radius: 5px;
            }

            .deck-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: bold;
            }

            .deck-a .deck-header h3 {
                color: #ff0080;
            }

            .deck-b .deck-header h3 {
                color: #00ff80;
            }

            .deck-status-led {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .led-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #ff0000;
                border: 2px solid #333;
                box-shadow: 0 0 5px rgba(255,0,0,0.5);
                transition: all 0.3s ease;
            }

            .led-indicator.playing {
                background: #00ff00;
                border-color: #00ff00;
                box-shadow: 0 0 10px rgba(0,255,0,0.8);
                animation: ledPulse 1s infinite;
            }

            .led-indicator.paused {
                background: #ffff00;
                border-color: #ffff00;
                box-shadow: 0 0 8px rgba(255,255,0,0.6);
            }

            @keyframes ledPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }

            .deck-status {
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 12px;
                font-weight: bold;
                border: 1px solid;
                background: rgba(255,0,0,0.2);
                border-color: #ff0000;
                color: #ff0000;
            }

            .track-info {
                text-align: center;
                padding: 10px;
                background: rgba(0,0,0,0.3);
                border-radius: 5px;
            }

            .track-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .track-artist {
                font-size: 12px;
                color: #888;
                margin-bottom: 5px;
            }

            .time-display {
                font-size: 12px;
                font-family: monospace;
            }

            .waveform-container {
                position: relative;
                height: 150px;
                background: rgba(0,0,0,0.5);
                border: 1px solid #333;
                border-radius: 5px;
                overflow: hidden;
            }

            .waveform-container canvas {
                width: 100%;
                height: 100%;
            }

            .waveform-controls {
                position: absolute;
                top: 5px;
                right: 5px;
                display: flex;
                gap: 5px;
                align-items: center;
                background: rgba(0,0,0,0.8);
                padding: 5px;
                border-radius: 5px;
                border: 1px solid #ffff00;
            }

            .zoom-btn {
                width: 25px;
                height: 25px;
                background: rgba(255,255,0,0.1);
                color: #ffff00;
                border: 1px solid #ffff00;
                border-radius: 3px;
                font-size: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .zoom-btn:hover {
                background: rgba(255,255,0,0.3);
                transform: scale(1.1);
            }

            .zoom-btn:active {
                transform: scale(0.95);
            }

            .zoom-level {
                font-size: 10px;
                color: #ffff00;
                font-family: monospace;
                min-width: 30px;
                text-align: center;
            }

            .playhead {
                position: absolute;
                top: 0;
                left: 0%;
                width: 2px;
                height: 100%;
                background: #ffff00;
                pointer-events: none;
            }

            .vu-meter-container {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 5px;
                background: rgba(0,0,0,0.3);
                border-radius: 5px;
                margin: 5px 0;
            }

            .vu-meter-label {
                font-size: 10px;
                font-weight: bold;
                color: #00ff00;
                width: 20px;
                text-align: center;
            }

            .vu-meter {
                flex: 1;
                height: 8px;
                background: rgba(0,0,0,0.5);
                border: 1px solid #333;
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }

            .vu-meter-bar {
                height: 100%;
                width: 0%;
                background: linear-gradient(to right, #00ff00, #ffff00, #ff0000);
                transition: width 0.1s ease;
                border-radius: 3px;
            }

            .transport-controls {
                display: flex;
                gap: 5px;
                justify-content: center;
            }

            .transport-controls button {
                padding: 8px 12px;
                border: 1px solid #00ffff;
                background: rgba(0,255,255,0.1);
                color: #00ffff;
                border-radius: 3px;
                cursor: pointer;
                font-family: monospace;
                font-size: 12px;
                transition: all 0.3s;
            }

            .transport-controls button:hover {
                background: rgba(0,255,255,0.3);
                transform: scale(1.05);
            }

            .eq-section {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }

            .eq-band {
                text-align: center;
            }

            .eq-band label {
                display: block;
                font-size: 10px;
                margin-bottom: 5px;
            }

            .eq-slider {
                width: 100%;
                height: 60px;
                writing-mode: bt-lr;
                -webkit-appearance: slider-vertical;
                background: linear-gradient(to top, #ff0000, #ffff00, #00ff00);
                outline: none;
                border-radius: 3px;
            }

            .kill-switch {
                width: 100%;
                height: 25px;
                background: linear-gradient(135deg, #ff4444, #cc0000);
                color: #ffffff;
                border: 2px solid #ff0000;
                border-radius: 5px;
                font-size: 10px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 5px;
                transition: all 0.2s ease;
                text-transform: uppercase;
            }

            .kill-switch:hover {
                background: linear-gradient(135deg, #ff6666, #ff0000);
                transform: scale(1.05);
                box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
            }

            .kill-switch.active {
                background: linear-gradient(135deg, #ff0000, #990000);
                border-color: #ffffff;
                box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
                animation: killPulse 0.5s ease-in-out;
            }

            @keyframes killPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .eq-visualizer {
                width: 100%;
                height: 80px;
                background: rgba(0, 10, 20, 0.8);
                border: 1px solid #00ffff;
                border-radius: 5px;
                margin-top: 10px;
            }

            .tempo-section {
                text-align: center;
            }

            .tempo-section label {
                display: block;
                font-size: 12px;
                margin-bottom: 5px;
            }

            .tempo-slider {
                width: 100%;
                height: 8px;
                background: linear-gradient(to right, #ff0000, #ffff00, #00ff00);
                outline: none;
                border-radius: 4px;
            }

            .volume-section {
                text-align: center;
            }

            .volume-section label {
                display: block;
                font-size: 12px;
                margin-bottom: 5px;
            }

            .cue-points {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 5px;
            }

            .btn-cue-point {
                padding: 8px;
                border: 1px solid #666;
                background: rgba(255,255,255,0.1);
                color: #fff;
                border-radius: 3px;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.3s;
            }

            .btn-cue-point.active {
                background: rgba(255,255,0,0.3);
                border-color: #ffff00;
                color: #ffff00;
            }

            .track-selector {
                display: flex;
                gap: 5px;
            }

            .track-selector select {
                flex: 1;
                padding: 5px;
                background: rgba(0,0,0,0.5);
                border: 1px solid #333;
                color: #fff;
                border-radius: 3px;
            }

            .btn-load {
                padding: 5px 10px;
                border: 1px solid #00ff00;
                background: rgba(0,255,0,0.1);
                color: #00ff00;
                border-radius: 3px;
                cursor: pointer;
                font-size: 10px;
            }

            .mixer-section {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 20px;
                padding: 20px 10px;
                background: rgba(0,0,0,0.5);
                border-radius: 10px;
                border: 2px solid #ffff00;
            }

            .crossfader-section {
                text-align: center;
            }

            .crossfader-section label {
                display: block;
                font-size: 12px;
                margin-bottom: 10px;
                color: #ffff00;
            }

            .crossfader-slider {
                width: 100px;
                height: 8px;
                background: linear-gradient(to right, #ff0080, #ffff00, #00ff80);
                outline: none;
                border-radius: 4px;
            }

            .crossfader-labels {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                margin-top: 5px;
            }

            .crossfader-curve-section {
                margin-top: 15px;
                padding: 10px;
                background: rgba(255,255,0,0.05);
                border-radius: 5px;
                border: 1px solid #ffff00;
            }

            .crossfader-curve-section label {
                display: block;
                font-size: 10px;
                margin-bottom: 5px;
                color: #ffff00;
            }

            .crossfader-curve-select {
                width: 100%;
                height: 25px;
                background: rgba(0,0,0,0.8);
                color: #ffff00;
                border: 1px solid #ffff00;
                border-radius: 3px;
                font-size: 10px;
                padding: 2px 5px;
                margin-bottom: 8px;
                cursor: pointer;
            }

            .crossfader-curve-select:hover {
                background: rgba(255,255,0,0.1);
            }

            .curve-preview {
                width: 100%;
                height: 60px;
                border: 1px solid #ffff00;
                border-radius: 3px;
                background: rgba(0,0,0,0.9);
            }

            .bpm-sync-section {
                text-align: center;
                padding: 10px;
                background: rgba(255,255,0,0.1);
                border-radius: 5px;
                border: 1px solid #ffff00;
            }

            .bpm-sync-section label {
                display: block;
                font-size: 12px;
                margin-bottom: 10px;
                color: #ffff00;
                font-weight: bold;
            }

            .sync-buttons {
                display: flex;
                gap: 5px;
                justify-content: center;
                margin-bottom: 10px;
            }

            .btn-sync {
                padding: 8px 12px;
                border: 1px solid #ffff00;
                background: rgba(255,255,0,0.1);
                color: #ffff00;
                border-radius: 3px;
                cursor: pointer;
                font-family: monospace;
                font-size: 10px;
                transition: all 0.3s;
            }

            .btn-sync:hover {
                background: rgba(255,255,0,0.3);
                transform: scale(1.05);
            }

            .btn-sync:active {
                background: rgba(255,255,0,0.5);
            }

            .bpm-display {
                font-size: 14px;
                font-weight: bold;
                color: #ffff00;
                padding: 5px;
                background: rgba(0,0,0,0.3);
                border-radius: 3px;
            }

            .master-section {
                text-align: center;
            }

            .master-bpm {
                font-size: 14px;
                font-weight: bold;
                color: #ffff00;
                margin-bottom: 10px;
            }

            .master-volume label {
                display: block;
                font-size: 10px;
                margin-bottom: 5px;
            }

            .volume-slider {
                width: 100%;
                height: 8px;
                background: linear-gradient(to right, #000, #ffff00, #fff);
                outline: none;
                border-radius: 4px;
            }

            .vu-meters {
                display: flex;
                justify-content: space-around;
                gap: 10px;
            }

            .vu-meter {
                width: 20px;
                height: 100px;
                background: rgba(0,0,0,0.8);
                border: 1px solid #333;
                border-radius: 3px;
                position: relative;
                overflow: hidden;
            }

            .vu-bar {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, #00ff00, #ffff00, #ff0000);
                height: var(--vu-height, 0%);
                transition: height 0.1s;
            }

            .beat-matching-section {
                text-align: center;
                padding: 10px;
                background: rgba(0,255,255,0.1);
                border-radius: 5px;
                border: 1px solid #00ffff;
            }

            .beat-matching-section label {
                display: block;
                font-size: 12px;
                margin-bottom: 10px;
                color: #00ffff;
                font-weight: bold;
            }

            .beat-indicators {
                display: flex;
                justify-content: space-around;
                gap: 10px;
                margin-bottom: 10px;
            }

            .beat-indicator {
                text-align: center;
                padding: 5px;
                background: rgba(0,0,0,0.3);
                border-radius: 3px;
                border: 1px solid #333;
            }

            .beat-light {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #333;
                margin: 0 auto 5px;
                transition: all 0.1s;
            }

            .beat-light.active {
                background: #00ff00;
                box-shadow: 0 0 10px #00ff00;
                animation: beatPulse 0.2s ease-in-out;
            }

            .beat-indicator span {
                display: block;
                font-size: 10px;
                color: #888;
            }

            .sync-status {
                font-size: 12px;
                font-weight: bold;
                padding: 5px;
                background: rgba(255,0,0,0.2);
                border: 1px solid #ff0000;
                border-radius: 3px;
                color: #ff0000;
            }

            .sync-status.synced {
                background: rgba(0,255,0,0.2);
                border-color: #00ff00;
                color: #00ff00;
            }

            .sync-status.close {
                background: rgba(255,255,0,0.2);
                border-color: #ffff00;
                color: #ffff00;
            }

            @keyframes beatPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            @media (max-width: 1200px) {
                .dj-mixer-container {
                    grid-template-columns: 1fr;
                    grid-template-rows: auto auto auto;
                }
                
                .mixer-section {
                    flex-direction: row;
                    justify-content: space-around;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Estilos techno aplicados para 2 decks');
    }

    // 🆕 EVENT LISTENERS PARA 2 DECKS
    setupEventListeners() {
        // Transport Deck A
        if (this.elements.playA) {
            console.log('✅ Configurando event listener para playA');
            this.elements.playA.addEventListener('click', () => this.playDeckA());
        } else {
            console.log('❌ Elemento playA no encontrado');
        }
        if (this.elements.pauseA) {
            this.elements.pauseA.addEventListener('click', () => this.pauseDeckA());
        }
        if (this.elements.stopA) {
            this.elements.stopA.addEventListener('click', () => this.stopDeckA());
        }
        if (document.getElementById('cueA')) {
            document.getElementById('cueA').addEventListener('click', () => this.cueDeckA());
        }

        // Transport Deck B
        if (this.elements.playB) {
            console.log('✅ Configurando event listener para playB');
            this.elements.playB.addEventListener('click', () => this.playDeckB());
        } else {
            console.log('❌ Elemento playB no encontrado');
        }
        if (this.elements.pauseB) {
            this.elements.pauseB.addEventListener('click', () => this.pauseDeckB());
        }
        if (this.elements.stopB) {
            this.elements.stopB.addEventListener('click', () => this.stopDeckB());
        }
        if (document.getElementById('cueB')) {
            document.getElementById('cueB').addEventListener('click', () => this.cueDeckB());
        }

        // EQ Deck A
        if (this.elements.eqLowA) {
            this.elements.eqLowA.addEventListener('input', (e) => {
                this.deckA.eq.low = parseFloat(e.target.value);
                this.updateEQ('A');
            });
        }
        if (this.elements.eqMidA) {
            this.elements.eqMidA.addEventListener('input', (e) => {
                this.deckA.eq.mid = parseFloat(e.target.value);
                this.updateEQ('A');
            });
        }
        if (this.elements.eqHighA) {
            this.elements.eqHighA.addEventListener('input', (e) => {
                this.deckA.eq.high = parseFloat(e.target.value);
                this.updateEQ('A');
            });
        }

        // 🆕 Kill Switches Deck A
        if (this.elements.killLowA) {
            this.elements.killLowA.addEventListener('click', () => this.toggleKillSwitch('A', 'low'));
        }
        if (this.elements.killMidA) {
            this.elements.killMidA.addEventListener('click', () => this.toggleKillSwitch('A', 'mid'));
        }
        if (this.elements.killHighA) {
            this.elements.killHighA.addEventListener('click', () => this.toggleKillSwitch('A', 'high'));
        }

        // EQ Deck B
        if (this.elements.eqLowB) {
            this.elements.eqLowB.addEventListener('input', (e) => {
                this.deckB.eq.low = parseFloat(e.target.value);
                this.updateEQ('B');
            });
        }
        if (this.elements.eqMidB) {
            this.elements.eqMidB.addEventListener('input', (e) => {
                this.deckB.eq.mid = parseFloat(e.target.value);
                this.updateEQ('B');
            });
        }
        if (this.elements.eqHighB) {
            this.elements.eqHighB.addEventListener('input', (e) => {
                this.deckB.eq.high = parseFloat(e.target.value);
                this.updateEQ('B');
            });
        }

        // 🆕 Kill Switches Deck B
        if (this.elements.killLowB) {
            this.elements.killLowB.addEventListener('click', () => this.toggleKillSwitch('B', 'low'));
        }
        if (this.elements.killMidB) {
            this.elements.killMidB.addEventListener('click', () => this.toggleKillSwitch('B', 'mid'));
        }
        if (this.elements.killHighB) {
            this.elements.killHighB.addEventListener('click', () => this.toggleKillSwitch('B', 'high'));
        }

        // Tempo Deck A
        if (this.elements.tempoA) {
            this.elements.tempoA.addEventListener('input', (e) => {
                this.deckA.tempo = parseFloat(e.target.value) / 100;
                this.updateTempo('A');
            });
        }

        // Tempo Deck B
        if (this.elements.tempoB) {
            this.elements.tempoB.addEventListener('input', (e) => {
                this.deckB.tempo = parseFloat(e.target.value) / 100;
                this.updateTempo('B');
            });
        }
        
        // Volume Deck A
        if (this.elements.volumeA) {
            this.elements.volumeA.addEventListener('input', (e) => {
                this.deckA.volume = parseFloat(e.target.value) / 100;
                this.updateVolume('A');
            });
        }
        
        // Volume Deck B
        if (this.elements.volumeB) {
            this.elements.volumeB.addEventListener('input', (e) => {
                this.deckB.volume = parseFloat(e.target.value) / 100;
                this.updateVolume('B');
            });
        }

        // Track Loaders
        if (this.elements.loadTrackA) {
            this.elements.loadTrackA.addEventListener('click', () => {
                // 🆕 Visual feedback para botón load
                this.flashButton(this.elements.loadTrackA, 250);
                
                const trackSelect = this.elements.trackSelectA.value;
                if (trackSelect) {
                    this.loadTrackForDeck('A', `/Music/${trackSelect}.mp3`);
                }
            });
        }

        if (this.elements.loadTrackB) {
            this.elements.loadTrackB.addEventListener('click', () => {
                // 🆕 Visual feedback para botón load
                this.flashButton(this.elements.loadTrackB, 250);
                
                const trackSelect = this.elements.trackSelectB.value;
                if (trackSelect) {
                    this.loadTrackForDeck('B', `/Music/${trackSelect}.mp3`);
                }
            });
        }

        // 🆕 Hot Cue Points - Deck A
        if (this.elements.cue1A) {
            this.elements.cue1A.addEventListener('click', () => this.toggleHotCue('A', 1));
        }
        if (this.elements.cue2A) {
            this.elements.cue2A.addEventListener('click', () => this.toggleHotCue('A', 2));
        }
        if (this.elements.cue3A) {
            this.elements.cue3A.addEventListener('click', () => this.toggleHotCue('A', 3));
        }
        if (this.elements.cue4A) {
            this.elements.cue4A.addEventListener('click', () => this.toggleHotCue('A', 4));
        }

        // 🆕 Hot Cue Points - Deck B
        if (this.elements.cue1B) {
            this.elements.cue1B.addEventListener('click', () => this.toggleHotCue('B', 1));
        }
        if (this.elements.cue2B) {
            this.elements.cue2B.addEventListener('click', () => this.toggleHotCue('B', 2));
        }
        if (this.elements.cue3B) {
            this.elements.cue3B.addEventListener('click', () => this.toggleHotCue('B', 3));
        }
        if (this.elements.cue4B) {
            this.elements.cue4B.addEventListener('click', () => this.toggleHotCue('B', 4));
        }

        // Crossfader y Master
        if (this.elements.crossfader) {
            this.elements.crossfader.addEventListener('input', (e) => {
                this.crossfader = parseFloat(e.target.value) / 100;
                this.updateCrossfader();
            });
        }

        if (this.elements.crossfaderCurve) {
            this.elements.crossfaderCurve.addEventListener('change', (e) => {
                this.crossfaderCurve = e.target.value;
                this.updateCrossfader();
                this.drawCurvePreview();
                console.log(`🎛️ Crossfader Curve cambiado a: ${this.crossfaderCurve}`);
            });
        }

        if (this.elements.masterVolume) {
            this.elements.masterVolume.addEventListener('input', (e) => {
                this.masterVolume = parseFloat(e.target.value) / 100;
                this.updateMasterVolume();
            });
        }

        // BPM Sync buttons
        const syncAtoB = document.getElementById('syncAtoB');
        const syncBtoA = document.getElementById('syncBtoA');
        
        if (syncAtoB) {
            syncAtoB.addEventListener('click', () => this.syncBPM('A', 'B'));
        }
        
        if (syncBtoA) {
            syncBtoA.addEventListener('click', () => this.syncBPM('B', 'A'));
        }

        // Cue Points Deck A
        for (let i = 1; i <= 4; i++) {
            const cueBtn = document.getElementById(`cue${i}A`);
            if (cueBtn) {
                cueBtn.addEventListener('click', () => this.toggleCuePoint('A', i));
            }
        }

        // Cue Points Deck B
        for (let i = 1; i <= 4; i++) {
            const cueBtn = document.getElementById(`cue${i}B`);
            if (cueBtn) {
                cueBtn.addEventListener('click', () => this.toggleCuePoint('B', i));
            }
        }

        // Waveform click listeners para seek
        if (this.elements.waveformA) {
            this.elements.waveformA.addEventListener('click', (e) => this.handleWaveformClick('A', e));
            this.elements.waveformA.addEventListener('wheel', (e) => this.handleWaveformWheel('A', e));
            // 🆕 Mouse drag para scroll horizontal
            this.elements.waveformA.addEventListener('mousedown', (e) => this.handleWaveformMouseDown('A', e));
            this.elements.waveformA.addEventListener('mousemove', (e) => this.handleWaveformMouseMove('A', e));
            this.elements.waveformA.addEventListener('mouseup', (e) => this.handleWaveformMouseUp('A', e));
            this.elements.waveformA.addEventListener('mouseleave', (e) => this.handleWaveformMouseUp('A', e));
        }
        if (this.elements.waveformB) {
            this.elements.waveformB.addEventListener('click', (e) => this.handleWaveformClick('B', e));
            this.elements.waveformB.addEventListener('wheel', (e) => this.handleWaveformWheel('B', e));
            // 🆕 Mouse drag para scroll horizontal
            this.elements.waveformB.addEventListener('mousedown', (e) => this.handleWaveformMouseDown('B', e));
            this.elements.waveformB.addEventListener('mousemove', (e) => this.handleWaveformMouseMove('B', e));
            this.elements.waveformB.addEventListener('mouseup', (e) => this.handleWaveformMouseUp('B', e));
            this.elements.waveformB.addEventListener('mouseleave', (e) => this.handleWaveformMouseUp('B', e));
        }

        // 🆕 Zoom controls Deck A
        if (this.elements.zoomInA) {
            this.elements.zoomInA.addEventListener('click', () => this.handleZoom('A', 'in'));
        }
        if (this.elements.zoomOutA) {
            this.elements.zoomOutA.addEventListener('click', () => this.handleZoom('A', 'out'));
        }
        if (this.elements.zoomResetA) {
            this.elements.zoomResetA.addEventListener('click', () => this.handleZoom('A', 'reset'));
        }

        // 🆕 Zoom controls Deck B
        if (this.elements.zoomInB) {
            this.elements.zoomInB.addEventListener('click', () => this.handleZoom('B', 'in'));
        }
        if (this.elements.zoomOutB) {
            this.elements.zoomOutB.addEventListener('click', () => this.handleZoom('B', 'out'));
        }
        if (this.elements.zoomResetB) {
            this.elements.zoomResetB.addEventListener('click', () => this.handleZoom('B', 'reset'));
        }

        console.log('✅ Event listeners configurados para 2 decks');
    }

    // 🆕 DESTROY METHOD - Cleanup de recursos
    destroy() {
        console.log('🧹 Limpiando recursos de DJ Console...');
        
        // Cancelar todas las animaciones
        Object.values(this.animationFrames).forEach(frame => {
            if (frame) cancelAnimationFrame(frame);
        });
        this.animationFrames = { A: null, B: null };
        
        // Detener ambos decks
        this.stopDeck('A');
        this.stopDeck('B');
        
        // Limpiar todos los nodes del pool
        this.nodePool.gainNodes.forEach(node => {
            try { node.disconnect(); } catch (e) {}
        });
        this.nodePool.analysers.forEach(node => {
            try { node.disconnect(); } catch (e) {}
        });
        this.nodePool.bufferSources.forEach(node => {
            try { node.disconnect(); } catch (e) {}
        });
        
        // Resetear pools
        this.nodePool = {
            gainNodes: [],
            analysers: [],
            bufferSources: []
        };
        
        // Limpiar event listeners (clonando elementos)
        Object.values(this.elements).forEach(el => {
            if (el && el.parentNode) {
                const clone = el.cloneNode(true);
                el.parentNode.replaceChild(clone, el);
            }
        });
        
        // EQ Visualizer contexts
        this.eqVisualizerCtxA = null;
        this.eqVisualizerCtxB = null;
        
        // Cerrar AudioContext si existe
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        console.log(' Recursos limpiados exitosamente');
    }

    // 🆕 KEYBOARD SHORTCUTS SYSTEM
    setupKeyboardShortcuts() {
        console.log('⌨️ Configurando atajos de teclado...');
        
        document.addEventListener('keydown', (e) => {
            // Ignorar si estamos escribiendo en inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            const key = e.key.toLowerCase();
            const hasShift = e.shiftKey;
            const hasCtrl = e.ctrlKey || e.metaKey;
            const hasAlt = e.altKey;
            
            console.log(`⌨️ Tecla presionada: ${key} (Shift: ${hasShift}, Ctrl: ${hasCtrl}, Alt: ${hasAlt})`);
            
            // 🎵 CONTROL DE REPRODUCCIÓN
            switch(key) {
                // H - Mostrar ayuda de atajos
                case 'h':
                    this.showKeyboardHelp();
                    break;
                    
                // Space - Play/Pause deck activo
                case ' ':
                    e.preventDefault();
                    this.togglePlayPauseDeck(this.activeDeck);
                    break;
                    
                // Q - Cue deck activo
                case 'q':
                    this.cueDeck(this.activeDeck);
                    break;
                    
                // S - Stop deck activo
                case 's':
                    this.stopDeck(this.activeDeck);
                    break;
                    
                // Tab - Cambiar deck activo
                case 'tab':
                    e.preventDefault();
                    this.switchActiveDeck();
                    break;
                    
                // 🎛️ CONTROL DE TEMPO
                // + / = - Aumentar tempo
                case '+':
                case '=':
                    this.adjustTempo(this.activeDeck, 0.05);
                    break;
                    
                // - - Disminuir tempo
                case '-':
                case '_':
                    this.adjustTempo(this.activeDeck, -0.05);
                    break;
                    
                // 0 - Reset tempo a 100%
                case '0':
                    this.resetTempo(this.activeDeck);
                    break;
                    
                // 🎚️ CONTROL DE VOLUMEN
                // Flecha arriba - Subir volumen deck activo
                case 'arrowup':
                    e.preventDefault();
                    this.adjustVolume(this.activeDeck, 0.05);
                    break;
                    
                // Flecha abajo - Bajar volumen deck activo
                case 'arrowdown':
                    e.preventDefault();
                    this.adjustVolume(this.activeDeck, -0.05);
                    break;
                    
                // Flecha izquierda - Crossfader a Deck A
                case 'arrowleft':
                    e.preventDefault();
                    this.adjustCrossfader(-0.1);
                    break;
                    
                // Flecha derecha - Crossfader a Deck B
                case 'arrowright':
                    e.preventDefault();
                    this.adjustCrossfader(0.1);
                    break;
                    
                // 🎛️ CONTROL DE EQ
                // 1/2/3 - EQ Low/Mid/High Deck A
                case '1':
                    this.adjustEQ('A', 'low', hasShift ? -5 : 5);
                    break;
                case '2':
                    this.adjustEQ('A', 'mid', hasShift ? -5 : 5);
                    break;
                case '3':
                    this.adjustEQ('A', 'high', hasShift ? -5 : 5);
                    break;
                    
                // 4/5/6 - EQ Low/Mid/High Deck B
                case '4':
                    this.adjustEQ('B', 'low', hasShift ? -5 : 5);
                    break;
                case '5':
                    this.adjustEQ('B', 'mid', hasShift ? -5 : 5);
                    break;
                case '6':
                    this.adjustEQ('B', 'high', hasShift ? -5 : 5);
                    break;
                    
                // 🔇 KILL SWITCHES (Ctrl + teclas EQ)
                case '1':
                    if (hasCtrl) this.toggleKillSwitch('A', 'low');
                    else this.adjustEQ('A', 'low', hasShift ? -5 : 5);
                    break;
                case '2':
                    if (hasCtrl) this.toggleKillSwitch('A', 'mid');
                    else this.adjustEQ('A', 'mid', hasShift ? -5 : 5);
                    break;
                case '3':
                    if (hasCtrl) this.toggleKillSwitch('A', 'high');
                    else this.adjustEQ('A', 'high', hasShift ? -5 : 5);
                    break;
                case '4':
                    if (hasCtrl) this.toggleKillSwitch('B', 'low');
                    else this.adjustEQ('B', 'low', hasShift ? -5 : 5);
                    break;
                case '5':
                    if (hasCtrl) this.toggleKillSwitch('B', 'mid');
                    else this.adjustEQ('B', 'mid', hasShift ? -5 : 5);
                    break;
                case '6':
                    if (hasCtrl) this.toggleKillSwitch('B', 'high');
                    else this.adjustEQ('B', 'high', hasShift ? -5 : 5);
                    break;
                    
                // 🎛️ CROSSFADER CURVES (Alt + 7-0)
                case '7':
                    if (hasAlt) {
                        const curves = ['linear', 'power', 'cut', 'smooth'];
                        const currentIndex = curves.indexOf(this.crossfaderCurve);
                        const nextIndex = (currentIndex + 1) % curves.length;
                        this.crossfaderCurve = curves[nextIndex];
                        if (this.elements.crossfaderCurve) {
                            this.elements.crossfaderCurve.value = this.crossfaderCurve;
                        }
                        this.updateCrossfader();
                        this.drawCurvePreview();
                        console.log(`🎛️ Crossfader Curve: ${this.crossfaderCurve}`);
                    }
                    break;
                case '8':
                    if (hasAlt) {
                        this.crossfaderCurve = 'linear';
                        if (this.elements.crossfaderCurve) {
                            this.elements.crossfaderCurve.value = this.crossfaderCurve;
                        }
                        this.updateCrossfader();
                        this.drawCurvePreview();
                        console.log(`🎛️ Crossfader Curve: Linear`);
                    }
                    break;
                case '9':
                    if (hasAlt) {
                        this.crossfaderCurve = 'power';
                        if (this.elements.crossfaderCurve) {
                            this.elements.crossfaderCurve.value = this.crossfaderCurve;
                        }
                        this.updateCrossfader();
                        this.drawCurvePreview();
                        console.log(`🎛️ Crossfader Curve: Power`);
                    }
                    break;
                case '0':
                    if (hasAlt) {
                        this.crossfaderCurve = 'cut';
                        if (this.elements.crossfaderCurve) {
                            this.elements.crossfaderCurve.value = this.crossfaderCurve;
                        }
                        this.updateCrossfader();
                        this.drawCurvePreview();
                        console.log(`🎛️ Crossfader Curve: Cut`);
                    }
                    break;
                    
                // 🎯 CUE POINTS
                // F1-F4 - Cue Points Deck A
                case 'f1':
                case 'f2':
                case 'f3':
                case 'f4':
                    const cueNumA = parseInt(key.replace('f', ''));
                    this.jumpToCuePoint('A', cueNumA);
                    break;
                    
                // F5-F8 - Cue Points Deck B
                case 'f5':
                case 'f6':
                case 'f7':
                case 'f8':
                    const cueNumB = parseInt(key.replace('f', '')) - 4;
                    this.jumpToCuePoint('B', cueNumB);
                    break;
                    
                // 🎯 HOT CUES - Atajos rápidos
                // Q,W,E,R - Hot Cues Deck A
                case 'q':
                    this.toggleHotCue('A', 1);
                    break;
                case 'w':
                    this.toggleHotCue('A', 2);
                    break;
                case 'e':
                    this.toggleHotCue('A', 3);
                    break;
                case 'r':
                    this.toggleHotCue('A', 4);
                    break;
                    
                // I,O,P,L - Hot Cues Deck B
                case 'i':
                    this.toggleHotCue('B', 1);
                    break;
                case 'o':
                    this.toggleHotCue('B', 2);
                    break;
                case 'p':
                    this.toggleHotCue('B', 3);
                    break;
                case 'l':
                    this.toggleHotCue('B', 4);
                    break;
                    
                // 🔄 SYNC
                // Z - Sync A → B
                case 'z':
                    this.syncBPM('A', 'B');
                    break;
                    
                // X - Sync B → A
                case 'x':
                    this.syncBPM('B', 'A');
                    break;
                    
                // 🔢 MASTER VOLUME
                // [ / ] - Master Volume
                case '[':
                    this.adjustMasterVolume(-0.05);
                    break;
                case ']':
                    this.adjustMasterVolume(0.05);
                    break;
                    
                // 🎹 SEEK
                // Home - Inicio del track
                case 'home':
                    e.preventDefault();
                    this.seekToStart(this.activeDeck);
                    break;
                    
                // End - Final del track
                case 'end':
                    e.preventDefault();
                    this.seekToEnd(this.activeDeck);
                    break;
                    
                // Page Up/Down - Seek +/- 10%
                case 'pageup':
                    e.preventDefault();
                    this.seekByPercentage(this.activeDeck, 0.1);
                    break;
                    
                // Page Down - Seek -10%
                case 'pagedown':
                    e.preventDefault();
                    this.seekByPercentage(this.activeDeck, -0.1);
                    break;
                    
                // 🆕 ZOOM CONTROLS
                // + - Zoom in del deck activo
                case '+':
                case '=':
                    e.preventDefault();
                    this.handleZoom(this.activeDeck, 'in');
                    break;
                    
                // - - Zoom out del deck activo
                case '-':
                case '_':
                    e.preventDefault();
                    this.handleZoom(this.activeDeck, 'out');
                    break;
                    
                // 0 - Reset zoom del deck activo (con Ctrl)
                case '0':
                    if (hasCtrl) {
                        e.preventDefault();
                        this.handleZoom(this.activeDeck, 'reset');
                    }
                    break;
            }
        });
        
        console.log('✅ Atajos de teclado configurados');
    }

    // 🆕 KEYBOARD HELPER METHODS
    togglePlayPauseDeck(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        if (deckData.isPlaying) {
            this.pauseDeck(deck);
        } else {
            this.playDeck(deck);
        }
    }

    switchActiveDeck() {
        this.activeDeck = this.activeDeck === 'A' ? 'B' : 'A';
        console.log(`🔄 Deck activo cambiado a: ${this.activeDeck}`);
        
        // Visual feedback del deck activo
        const deckAElement = document.querySelector('.deck-a');
        const deckBElement = document.querySelector('.deck-b');
        
        if (deckAElement && deckBElement) {
            if (this.activeDeck === 'A') {
                deckAElement.classList.add('active-deck');
                deckBElement.classList.remove('active-deck');
            } else {
                deckBElement.classList.add('active-deck');
                deckAElement.classList.remove('active-deck');
            }
        }
    }

    adjustTempo(deck, delta) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        deckData.tempo = Math.max(0.5, Math.min(2.0, deckData.tempo + delta));
        this.updateTempo(deck);
    }

    resetTempo(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        deckData.tempo = 1.0;
        this.updateTempo(deck);
    }

    adjustVolume(deck, delta) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        deckData.volume = Math.max(0, Math.min(1, deckData.volume + delta));
        this.updateVolume(deck);
    }

    adjustCrossfader(delta) {
        this.crossfader = Math.max(0, Math.min(1, this.crossfader + delta));
        this.updateCrossfader();
    }

    adjustEQ(deck, band, delta) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        deckData.eq[band] = Math.max(-20, Math.min(20, deckData.eq[band] + delta));
        this.updateEQ(deck);
    }

    jumpToCuePoint(deck, cueNumber) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const cuePoint = deckData.cuePoints[cueNumber - 1];
        
        if (cuePoint !== null) {
            deckData.currentTime = cuePoint;
            this.updateTimeDisplay(deck);
            this.updatePlayhead(deck);
            console.log(`🎯 Saltando a Cue ${cueNumber} en Deck ${deck}: ${cuePoint.toFixed(2)}s`);
        }
    }

    // 🆕 HOT CUES FUNCTIONALITY
    toggleHotCue(deck, cueNumber) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const cueButton = deck === 'A' ? 
            this.elements[`cue${cueNumber}A`] : 
            this.elements[`cue${cueNumber}B`];
        
        if (!deckData.audioBuffer) {
            console.log(`⚠️ No hay track cargado en Deck ${deck}`);
            return;
        }

        const cueIndex = cueNumber - 1;
        const currentTime = deckData.currentTime;

        // Si ya existe un cue point, saltar a él
        if (deckData.cuePoints[cueIndex] !== null) {
            deckData.currentTime = deckData.cuePoints[cueIndex];
            this.updateTimeDisplay(deck);
            this.updatePlayhead(deck);
            
            // Visual feedback
            if (cueButton) {
                this.flashButton(cueButton, 150);
                cueButton.style.background = 'linear-gradient(135deg, #00ffff, #0088ff)';
                setTimeout(() => {
                    cueButton.style.background = '';
                }, 300);
            }
            
            console.log(`🎯 Saltando a Hot Cue ${cueNumber} en Deck ${deck}: ${deckData.cuePoints[cueIndex].toFixed(2)}s`);
        } else {
            // Si no existe, crear nuevo cue point
            deckData.cuePoints[cueIndex] = currentTime;
            
            // Visual feedback
            if (cueButton) {
                this.flashButton(cueButton, 200);
                cueButton.style.background = 'linear-gradient(135deg, #00ff00, #00aa00)';
                cueButton.style.color = '#ffffff';
                setTimeout(() => {
                    cueButton.style.background = '';
                    cueButton.style.color = '';
                }, 500);
            }
            
            // Actualizar visualización en waveform
            this.updateWaveformCues(deck);
            
            // 🆕 Guardar cue points automáticamente
            this.saveCuePoints(deck);
            
            console.log(`📍 Hot Cue ${cueNumber} guardado en Deck ${deck}: ${currentTime.toFixed(2)}s`);
        }
    }

    // 🆕 KILL SWITCHES FUNCTIONALITY
    toggleKillSwitch(deck, band) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const killButton = deck === 'A' ? 
            this.elements[`kill${band.charAt(0).toUpperCase() + band.slice(1)}A`] : 
            this.elements[`kill${band.charAt(0).toUpperCase() + band.slice(1)}B`];
        
        if (!deckData.audioBuffer) {
            console.log(`⚠️ No hay track cargado en Deck ${deck}`);
            return;
        }

        // Toggle kill switch state
        deckData.killSwitches[band] = !deckData.killSwitches[band];
        
        if (deckData.killSwitches[band]) {
            // Activar kill switch - set EQ to -inf (corte total)
            const previousValue = deckData.eq[band];
            deckData.eq[band] = -60; // -inf approximation
            
            // Visual feedback
            if (killButton) {
                killButton.classList.add('active');
                killButton.textContent = 'ACTIVE';
                this.flashButton(killButton, 300);
            }
            
            console.log(`🔇 Kill Switch ${band.toUpperCase()} ACTIVADO en Deck ${deck} (era: ${previousValue.toFixed(1)})`);
        } else {
            // Desactivar kill switch - restore EQ to 0
            deckData.eq[band] = 0;
            
            // Visual feedback
            if (killButton) {
                killButton.classList.remove('active');
                killButton.textContent = 'KILL';
                this.flashButton(killButton, 200);
            }
            
            console.log(`🔊 Kill Switch ${band.toUpperCase()} DESACTIVADO en Deck ${deck}`);
        }
        
        // Aplicar cambios y actualizar UI
        this.updateEQ(deck);
    }

    adjustMasterVolume(delta) {
        this.masterVolume = Math.max(0, Math.min(1, this.masterVolume + delta));
        this.updateMasterVolume();
    }

    seekToStart(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        deckData.currentTime = 0;
        this.updateTimeDisplay(deck);
        this.updatePlayhead(deck);
    }

    seekToEnd(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        if (deckData.duration > 0) {
            deckData.currentTime = deckData.duration - 0.1; // 100ms antes del final
            this.updateTimeDisplay(deck);
            this.updatePlayhead(deck);
        }
    }

    seekByPercentage(deck, percentage) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        if (deckData.duration > 0) {
            const delta = deckData.duration * percentage;
            deckData.currentTime = Math.max(0, Math.min(deckData.duration, deckData.currentTime + delta));
            this.updateTimeDisplay(deck);
            this.updatePlayhead(deck);
        }
    }

    // 🆕 Show keyboard shortcuts help
    showKeyboardHelp() {
        console.log(`
⌨️  DJ CONSOLE - ATAJOS DE TECLADO
====================================

🎵 CONTROL DE REPRODUCCIÓN:
  Space     - Play/Pause deck activo
  Q         - Cue deck activo  
  S         - Stop deck activo
  Tab       - Cambiar deck activo (A ↔ B)

🎛️ CONTROL DE TEMPO:
  +/=       - Aumentar tempo (+5%)
  -/_       - Disminuir tempo (-5%)
  0         - Reset tempo a 100%

🎚️ CONTROL DE VOLUMEN:
  ↑/↓       - Subir/Bajar volumen deck activo
  ←/→       - Crossfader (A/B)
  [/]       - Master Volume

🎛️ CONTROL DE EQ (Shift para decrementar):
  1/2/3     - EQ Low/Mid/High Deck A
  4/5/6     - EQ Low/Mid/High Deck B
  
🔇 KILL SWITCHES (Ctrl + teclas EQ):
  Ctrl+1/2/3 - Kill Low/Mid/High Deck A
  Ctrl+4/5/6 - Kill Low/Mid/High Deck B

🎛️ CROSSFADER CURVES (Alt + teclas):
  Alt+7     - Ciclar entre curvas (Linear/Power/Cut/Smooth)
  Alt+8     - Curva Linear
  Alt+9     - Curva Power
  Alt+0     - Curva Cut

🎯 CUE POINTS:
  F1-F4     - Saltar a Cue 1-4 Deck A
  F5-F8     - Saltar a Cue 1-4 Deck B
  
🎯 HOT CUES (Click para guardar, click para saltar):
  Q,W,E,R   - Hot Cues 1-4 Deck A
  I,O,P,L   - Hot Cues 1-4 Deck B

🔄 SYNC:
  Z         - Sync A → B
  X         - Sync B → A

🎹 SEEK:
  Home      - Inicio del track
  End       - Final del track
  PageUp    - Adelantar +10%
  PageDown  - Retroceder -10%

Deck Activo: ${this.activeDeck}
        `);
    }

    // 🆕 VISUAL FEEDBACK METHODS
    setButtonPressed(button, pressed = true) {
        if (!button) return;
        
        if (pressed) {
            button.classList.add('pressed');
            button.style.transform = 'scale(0.95)';
            button.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8)';
        } else {
            button.classList.remove('pressed');
            button.style.transform = '';
            button.style.boxShadow = '';
        }
    }
    
    flashButton(button, duration = 150) {
        if (!button) return;
        
        this.setButtonPressed(button, true);
        setTimeout(() => {
            this.setButtonPressed(button, false);
        }, duration);
    }
    
    setSliderActive(slider, active = true) {
        if (!slider) return;
        
        if (active) {
            slider.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.6)';
            slider.style.borderColor = '#00ff88';
        } else {
            slider.style.boxShadow = '';
            slider.style.borderColor = '';
        }
    }

    // Métodos para Deck A
    async loadTrackForDeck(deck, trackUrl) {
        try {
            console.log(`🎵 Cargando track para Deck ${deck}:`, trackUrl);
            const deckData = deck === 'A' ? this.deckA : this.deckB;
            
            // Actualizar UI
            const trackNameEl = deck === 'A' ? this.elements.trackNameA : this.elements.trackNameB;
            const trackArtistEl = deck === 'A' ? this.elements.trackArtistA : this.elements.trackArtistB;
            
            if (trackNameEl) trackNameEl.textContent = 'CARGANDO...';
            if (trackArtistEl) trackArtistEl.textContent = 'Procesando audio...';

            const response = await fetch(trackUrl);
            const arrayBuffer = await response.arrayBuffer();
            deckData.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            // Extraer nombre del track
            const trackName = trackUrl.split('/').pop().split('.')[0];
            const trackNames = {
                'track1': '🎵 4 - dR.iAn',
                'mereconozco': '🎵 Me Reconozco - Rodrigo Escamilla',
                'mariutodalanoche': '🎵 Toda La Noche - Mariu',
                'acontratiempo': '🎵 A Contratiempo - Demian Cobo ft. Daniel Tejeda'
            };

            if (trackNameEl) trackNameEl.textContent = trackNames[trackName] || trackName;
            if (trackArtistEl) trackArtistEl.textContent = 'DJMESH LIBRARY';
            
            deckData.duration = deckData.audioBuffer.duration;
            deckData.currentTime = 0;
            deckData.currentTrack = trackName; // Guardar nombre del track, no URL
            
            // 🆕 Auto-cue al inicio - Limpiar cue points anteriores
            deckData.cuePoints = [null, null, null, null];
            
            // 🆕 Cargar cue points guardados para este track
            this.loadCuePoints(deck);
            
            this.updateTimeDisplay(deck);
            this.detectBPM(deck);
            this.drawWaveform(deck);
            
            // 🆕 Inicializar curva de EQ
            this.drawEQCurve(deck);

            console.log(`✅ Track cargado en Deck ${deck}: ${trackNames[trackName] || trackName}`);
        } catch (error) {
            console.error(`❌ Error cargando track en Deck ${deck}:`, error);
            const trackNameEl = deck === 'A' ? this.elements.trackNameA : this.elements.trackNameB;
            const trackArtistEl = deck === 'A' ? this.elements.trackArtistA : this.elements.trackArtistB;
            
            if (trackNameEl) trackNameEl.textContent = 'ERROR CARGANDO';
            if (trackArtistEl) trackArtistEl.textContent = 'Intenta de nuevo';
        }
    }

    playDeckA() {
        console.log('🎵 playDeckA llamado');
        this.playDeck('A');
    }

    pauseDeckA() {
        this.pauseDeck('A');
    }

    stopDeckA() {
        this.stopDeck('A');
    }

    cueDeckA() {
        this.cueDeck('A');
    }

    playDeckB() {
        console.log('🎵 playDeckB llamado');
        this.playDeck('B');
    }

    pauseDeckB() {
        this.pauseDeck('B');
    }

    stopDeckB() {
        this.stopDeck('B');
    }

    cueDeckB() {
        this.cueDeck('B');
    }

    playDeck(deck) {
        console.log(`🎵 playDeck llamado para Deck ${deck}`);
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        if (!deckData.audioBuffer || deckData.isPlaying) {
            console.log(`❌ No se puede reproducir Deck ${deck}: audioBuffer=${!!deckData.audioBuffer}, isPlaying=${deckData.isPlaying}`);
            return;
        }

        // 🆕 Visual feedback para botón play
        const playButton = deck === 'A' ? this.elements.playA : this.elements.playB;
        const pauseButton = deck === 'A' ? this.elements.pauseA : this.elements.pauseB;
        const stopButton = deck === 'A' ? this.elements.stopA : this.elements.stopB;
        
        if (playButton) this.setButtonPressed(playButton, true);
        if (pauseButton) this.setButtonPressed(pauseButton, false);
        if (stopButton) this.setButtonPressed(stopButton, false);

        // 🆕 Usar nodes del pool en lugar de crear nuevos
        // Devolver nodes anteriores al pool si existen
        if (deckData.gainNode) {
            this.returnGainNode(deckData.gainNode);
        }
        if (deckData.analyser) {
            this.returnAnalyser(deckData.analyser);
        }
        
        // Obtener nodes del pool
        deckData.source = this.getBufferSource();
        deckData.source.buffer = deckData.audioBuffer;
        deckData.gainNode = this.getGainNode();
        deckData.analyser = this.getAnalyser();
        
        // Aplicar tempo
        deckData.source.playbackRate.value = deckData.tempo;
        
        // Conectar nodes con EQ y crossfader
        deckData.source.connect(deckData.eqFilters.low);
        deckData.eqFilters.low.connect(deckData.eqFilters.mid);
        deckData.eqFilters.mid.connect(deckData.eqFilters.high);
        deckData.eqFilters.high.connect(deckData.gainNode);
        deckData.gainNode.connect(deckData.analyser);
        
        // 🆕 Conectar analizador de espectro para EQ visualization
        deckData.gainNode.connect(deckData.spectrumAnalyzer);
        
        // Conectar al master crossfader
        this.connectDeckToMaster(deck);
        
        // Iniciar reproducción
        deckData.source.start(0, deckData.currentTime);
        deckData.isPlaying = true;
        
        // Actualizar UI
        this.updateDeckStatus(deck, 'PLAYING', 'playing');
        
        // Iniciar animación
        this.animateDeck(deck);
        
        // Iniciar beat matching
        this.startBeatMatching(deck);
        
        console.log(`▶️ Deck ${deck} playing`);
    }

    pauseDeck(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        if (!deckData.isPlaying) return;

        // 🆕 Visual feedback para botón pause
        const playButton = deck === 'A' ? this.elements.playA : this.elements.playB;
        const pauseButton = deck === 'A' ? this.elements.pauseA : this.elements.pauseB;
        const stopButton = deck === 'A' ? this.elements.stopA : this.elements.stopB;
        
        if (playButton) this.setButtonPressed(playButton, false);
        if (pauseButton) this.setButtonPressed(pauseButton, true);
        if (stopButton) this.setButtonPressed(stopButton, false);

        // 🆕 Detener source y devolver nodes al pool
        if (deckData.source) {
            try {
                deckData.source.stop();
            } catch (e) {
                console.log('🔄 Source ya detenido');
            }
        }
        
        if (deckData.gainNode) {
            this.returnGainNode(deckData.gainNode);
            deckData.gainNode = null;
        }
        
        if (deckData.analyser) {
            this.returnAnalyser(deckData.analyser);
            deckData.analyser = null;
        }
        
        deckData.isPlaying = false;
        deckData.source = null;
        
        // Detener beat matching
        this.stopBeatMatching(deck);

        // Actualizar UI
        this.updateDeckStatus(deck, 'PAUSED', 'paused');
        
        console.log(`⏸️ Deck ${deck} paused`);
    }

    stopDeck(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        // 🆕 Visual feedback para botón stop
        const playButton = deck === 'A' ? this.elements.playA : this.elements.playB;
        const pauseButton = deck === 'A' ? this.elements.pauseA : this.elements.pauseB;
        const stopButton = deck === 'A' ? this.elements.stopA : this.elements.stopB;
        
        if (playButton) this.setButtonPressed(playButton, false);
        if (pauseButton) this.setButtonPressed(pauseButton, false);
        if (stopButton) this.flashButton(stopButton, 200);

        // 🆕 Devolver nodes al pool antes de detener
        if (deckData.source) {
            try {
                deckData.source.stop();
            } catch (e) {
                console.log('🔄 Source ya detenido');
            }
        }
        
        if (deckData.gainNode) {
            this.returnGainNode(deckData.gainNode);
            deckData.gainNode = null;
        }
        
        if (deckData.analyser) {
            this.returnAnalyser(deckData.analyser);
            deckData.analyser = null;
        }
        
        deckData.isPlaying = false;
        deckData.currentTime = 0;
        deckData.source = null;
        
        // Detener beat matching
        this.stopBeatMatching(deck);

        // Actualizar UI
        this.updateDeckStatus(deck, 'STOPPED', 'stopped');
        
        this.updateTimeDisplay(deck);
        this.updatePlayhead(deck);

        console.log(`⏹️ Deck ${deck} stopped`);
    }

    cueDeck(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        // 🆕 Visual feedback para botón cue
        const cueButton = deck === 'A' ? this.elements.cueA : this.elements.cueB;
        if (cueButton) this.flashButton(cueButton, 150);
        
        if (deckData.isPlaying) {
            this.pauseDeck(deck);
        }
        
        deckData.currentTime = 0;
        this.updateTimeDisplay(deck);
        this.updatePlayhead(deck);
        
        console.log(`⏮️ Deck ${deck} cued to start`);
    }

    animateDeck(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        if (!deckData.isPlaying) return;
        
        // 🆕 Cancelar animación anterior si existe
        if (this.animationFrames[deck]) {
            cancelAnimationFrame(this.animationFrames[deck]);
        }
        
        deckData.currentTime += 0.016 * deckData.tempo; // ~60fps
        
        if (deckData.currentTime >= deckData.duration) {
            this.stopDeck(deck);
            return;
        }
        
        this.updateTimeDisplay(deck);
        this.updatePlayhead(deck);
        this.updateVUMeters(deck);
        
        // 🆕 Actualizar curva de EQ animada
        this.drawEQCurve(deck);
        
        // 🆕 Guardar referencia del animation frame
        this.animationFrames[deck] = requestAnimationFrame(() => this.animateDeck(deck));
    }

    updateTimeDisplay(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const currentEl = deck === 'A' ? this.elements.currentTimeA : this.elements.currentTimeB;
        const totalEl = deck === 'A' ? this.elements.totalTimeA : this.elements.totalTimeB;
        
        if (currentEl) {
            currentEl.textContent = this.formatTime(deckData.currentTime);
        }
        if (totalEl) {
            totalEl.textContent = this.formatTime(deckData.duration);
        }
    }

    updatePlayhead(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const playheadEl = deck === 'A' ? this.elements.playheadA : this.elements.playheadB;
        
        if (playheadEl && deckData.duration > 0) {
            // 🆕 Calcular posición considerando zoom y offset
            const visibleDuration = deckData.duration / deckData.zoom.level;
            const startTime = deckData.zoom.offset;
            
            // Calcular posición relativa al rango visible
            const relativePosition = (deckData.currentTime - startTime) / visibleDuration;
            
            // Solo mostrar playhead si está visible en el rango actual
            if (relativePosition >= 0 && relativePosition <= 1) {
                const progress = relativePosition * 100;
                playheadEl.style.left = `${progress}%`;
                playheadEl.style.display = 'block';
            } else {
                // Ocultar playhead si está fuera del rango visible
                playheadEl.style.display = 'none';
            }
        }
    }

    handleWaveformClick(deck, event) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        if (!deckData.audioBuffer || !deckData.duration) return;
        
        const waveform = event.currentTarget;
        const rect = waveform.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * deckData.duration;
        
        // Actualizar tiempo actual
        deckData.currentTime = newTime;
        
        // Si está reproduciendo, hacer seek
        if (deckData.isPlaying && deckData.source) {
            // 🆕 Devolver nodes al pool antes de hacer seek
            if (deckData.gainNode) {
                this.returnGainNode(deckData.gainNode);
            }
            if (deckData.analyser) {
                this.returnAnalyser(deckData.analyser);
            }
            
            // Detener source actual
            try {
                deckData.source.stop();
            } catch (e) {
                console.log('🔄 Source ya detenido durante seek');
            }
            
            // 🆕 Obtener nuevos nodes del pool
            deckData.source = this.getBufferSource();
            deckData.source.buffer = deckData.audioBuffer;
            deckData.source.playbackRate.value = deckData.tempo;
            deckData.gainNode = this.getGainNode();
            deckData.analyser = this.getAnalyser();
            
            // Reconectar la cadena de audio
            deckData.source.connect(deckData.eqFilters.low);
            deckData.eqFilters.low.connect(deckData.eqFilters.mid);
            deckData.eqFilters.mid.connect(deckData.eqFilters.high);
            deckData.eqFilters.high.connect(deckData.gainNode);
            deckData.gainNode.connect(deckData.analyser);
            
            // 🆕 Conectar analizador de espectro
            deckData.gainNode.connect(deckData.spectrumAnalyzer);
            
            this.connectDeckToMaster(deck);
            
            // Iniciar desde nueva posición
            deckData.source.start(0, newTime);
        }
        
        // Actualizar UI
        this.updateTimeDisplay(deck);
        this.updatePlayhead(deck);
        
        console.log(`🎯 Deck ${deck} seek to ${this.formatTime(newTime)}`);
    }

    // 🆕 WAVEFORM ZOOM HANDLER
    handleZoom(deck, action) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const zoomLevelEl = deck === 'A' ? this.elements.zoomLevelA : this.elements.zoomLevelB;
        
        switch (action) {
            case 'in':
                if (deckData.zoom.level < deckData.zoom.maxZoom) {
                    deckData.zoom.level *= 2;
                    console.log(`🔍 Zoom in Deck ${deck}: ${deckData.zoom.level}x`);
                }
                break;
                
            case 'out':
                if (deckData.zoom.level > deckData.zoom.minZoom) {
                    deckData.zoom.level /= 2;
                    // Ajustar offset para mantener la vista centrada
                    const maxOffset = Math.max(0, deckData.duration - (deckData.duration / deckData.zoom.level));
                    deckData.zoom.offset = Math.min(deckData.zoom.offset, maxOffset);
                    console.log(`🔍 Zoom out Deck ${deck}: ${deckData.zoom.level}x`);
                }
                break;
                
            case 'reset':
                deckData.zoom.level = 1;
                deckData.zoom.offset = 0;
                console.log(`🔍 Zoom reset Deck ${deck}: 1x`);
                break;
        }
        
        // Actualizar UI
        if (zoomLevelEl) {
            zoomLevelEl.textContent = `${deckData.zoom.level}x`;
        }
        
        // Redibujar waveform con nuevo zoom
        this.drawWaveform(deck);
        
        // Actualizar playhead
        this.updatePlayhead(deck);
        
        // 🆕 Actualizar cursor del waveform
        const waveform = deck === 'A' ? this.elements.waveformA : this.elements.waveformB;
        if (waveform) {
            waveform.style.cursor = deckData.zoom.level > 1 ? 'grab' : 'pointer';
        }
    }

    // 🆕 WAVEFORM WHEEL HANDLER - Scroll horizontal con zoom
    handleWaveformWheel(deck, event) {
        event.preventDefault(); // Prevenir scroll vertical
        
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        // Solo permitir scroll si hay zoom (> 1x)
        if (deckData.zoom.level <= 1) return;
        
        const visibleDuration = deckData.duration / deckData.zoom.level;
        const maxOffset = deckData.duration - visibleDuration;
        
        // Calcular scroll amount basado en delta de la rueda
        const scrollAmount = event.deltaY > 0 ? 0.05 : -0.05; // 5% de la duración visible
        const newOffset = deckData.zoom.offset + (scrollAmount * visibleDuration);
        
        // Limitar offset dentro de los bounds válidos
        deckData.zoom.offset = Math.max(0, Math.min(maxOffset, newOffset));
        
        // Redibujar waveform con nuevo offset
        this.drawWaveform(deck);
        
        // Actualizar playhead
        this.updatePlayhead(deck);
        
        console.log(`🔄 Waveform scroll Deck ${deck}: offset=${deckData.zoom.offset.toFixed(2)}s`);
    }

    // 🆕 WAVEFORM MOUSE DRAG HANDLERS
    handleWaveformMouseDown(deck, event) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        // Solo permitir drag si hay zoom (> 1x)
        if (deckData.zoom.level <= 1) return;
        
        // Prevenir comportamiento por defecto y cursor de texto
        event.preventDefault();
        
        // Iniciar drag
        deckData.drag.isDragging = true;
        deckData.drag.startX = event.clientX;
        deckData.drag.startOffset = deckData.zoom.offset;
        
        // Cambiar cursor
        const waveform = deck === 'A' ? this.elements.waveformA : this.elements.waveformB;
        if (waveform) {
            waveform.style.cursor = 'grabbing';
        }
        
        console.log(`🖱️ Iniciando drag en Deck ${deck}`);
    }

    handleWaveformMouseMove(deck, event) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        // Solo procesar si está en modo drag
        if (!deckData.drag.isDragging) return;
        
        // Prevenir selección de texto
        event.preventDefault();
        
        // Calcular delta del movimiento
        const deltaX = event.clientX - deckData.drag.startX;
        
        // Convertir delta del mouse a tiempo (ajuste sensible)
        const waveform = deck === 'A' ? this.elements.waveformA : this.elements.waveformB;
        if (!waveform) return;
        
        const rect = waveform.getBoundingClientRect();
        const pixelsPerSecond = rect.width / (deckData.duration / deckData.zoom.level);
        const deltaTime = -deltaX / pixelsPerSecond; // Negativo para arrastre natural
        
        // Calcular nuevo offset
        const newOffset = deckData.drag.startOffset + deltaTime;
        
        // Limitar offset dentro de bounds válidos
        const visibleDuration = deckData.duration / deckData.zoom.level;
        const maxOffset = deckData.duration - visibleDuration;
        deckData.zoom.offset = Math.max(0, Math.min(maxOffset, newOffset));
        
        // Redibujar waveform con nuevo offset
        this.drawWaveform(deck);
        
        // Actualizar playhead
        this.updatePlayhead(deck);
    }

    handleWaveformMouseUp(deck, event) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        // Finalizar drag si estaba activo
        if (deckData.drag.isDragging) {
            deckData.drag.isDragging = false;
            
            // Restaurar cursor
            const waveform = deck === 'A' ? this.elements.waveformA : this.elements.waveformB;
            if (waveform) {
                waveform.style.cursor = deckData.zoom.level > 1 ? 'grab' : 'pointer';
            }
            
            console.log(`🖱️ Finalizando drag en Deck ${deck}: offset=${deckData.zoom.offset.toFixed(2)}s`);
        }
    }

    updateVUMeters(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        if (!deckData.analyser) return;
        
        const dataArray = new Uint8Array(deckData.analyser.frequencyBinCount);
        deckData.analyser.getByteFrequencyData(dataArray);
        
        // Calcular promedio de frecuencias para VU meter
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalized = average / 255;
        
        // Actualizar VU meters con los elementos correctos
        const vuBar = deck === 'A' ? this.elements.vuMeterBarA : this.elements.vuMeterBarB;
        if (vuBar) {
            // Convertir a porcentaje y aplicar logaritmo para mejor respuesta visual
            const dbLevel = 20 * Math.log10(normalized + 0.001); // Evitar log(0)
            const percentage = Math.max(0, Math.min(100, (dbLevel + 60) * 100 / 60));
            vuBar.style.width = `${percentage}%`;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    drawWaveform(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const canvas = deck === 'A' ? this.elements.waveformA : this.elements.waveformB;
        const ctx = deck === 'A' ? this.waveformCtxA : this.waveformCtxB;
        
        if (!canvas || !ctx || !deckData.audioBuffer) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const data = deckData.audioBuffer.getChannelData(0);
        
        // 🆕 DOWNSAMPLING para mejor performance con soporte de ZOOM
        // Calcular rango visible basado en zoom y offset
        const visibleDuration = deckData.duration / deckData.zoom.level;
        const startTime = deckData.zoom.offset;
        const endTime = Math.min(startTime + visibleDuration, deckData.duration);
        
        // Convertir tiempos a índices de samples
        const startSample = Math.floor((startTime / deckData.duration) * data.length);
        const endSample = Math.floor((endTime / deckData.duration) * data.length);
        const visibleData = data.slice(startSample, endSample);
        
        // 🆕 OPTIMIZACIÓN: Limitar puntos basado en tamaño del canvas y nivel de zoom
        // Más agresivo para tracks largos
        const trackLengthMinutes = deckData.duration / 60;
        let maxPoints;
        
        if (trackLengthMinutes > 10) {
            // Tracks muy largos: menos puntos para mejor rendimiento
            maxPoints = width * 1.5;
        } else if (trackLengthMinutes > 5) {
            // Tracks largos: balance entre calidad y rendimiento
            maxPoints = width * 2;
        } else {
            // Tracks cortos: máxima calidad
            maxPoints = width * 3;
        }
        
        const downsampleFactor = Math.max(1, Math.floor(visibleData.length / maxPoints));
        const downsampled = [];
        
        // 🆕 OPTIMIZACIÓN: Usar método más eficiente para downsampling
        // Peak picking para mejor visualización con menos puntos
        if (downsampleFactor > 8) {
            // Para factores grandes, usar peak picking
            for (let i = 0; i < visibleData.length; i += downsampleFactor) {
                let max = 0;
                let min = 0;
                
                // Encontrar picos en el grupo
                for (let j = i; j < Math.min(i + downsampleFactor, visibleData.length); j++) {
                    const val = visibleData[j];
                    if (val > max) max = val;
                    if (val < min) min = val;
                }
                
                // Guardar ambos picos para mejor representación
                downsampled.push(Math.abs(max), Math.abs(min));
            }
        } else {
            // Para factores pequeños, usar averaging
            for (let i = 0; i < visibleData.length; i += downsampleFactor) {
                let sum = 0;
                let count = 0;
                
                // Promediar grupo de samples
                for (let j = i; j < Math.min(i + downsampleFactor, visibleData.length); j++) {
                    sum += Math.abs(visibleData[j]); // Usar valor absoluto para mejor visualización
                    count++;
                }
                
                downsampled.push(count > 0 ? sum / count : 0);
            }
        }
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // 🆕 Dibujar fondo con indicador de región visible si hay zoom
        if (deckData.zoom.level > 1) {
            // Calcular posición y tamaño de la región visible
            const visibleStart = (deckData.zoom.offset / deckData.duration) * width;
            const visibleWidth = (deckData.duration / deckData.zoom.level / deckData.duration) * width;
            
            // Dibujar región completa con baja opacidad
            ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
            ctx.fillRect(0, 0, width, height);
            
            // Dibujar región visible con mayor opacidad
            ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
            ctx.fillRect(visibleStart, 0, visibleWidth, height);
            
            // Dibujar bordes de la región visible
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(visibleStart, 0, visibleWidth, height);
            ctx.setLineDash([]);
        }
        
        // 🆕 Dibujar waveform optimizado con barras (más eficiente)
        ctx.fillStyle = '#00ff88';
        const barWidth = width / downsampled.length;
        
        downsampled.forEach((value, index) => {
            const barHeight = value * height * 0.8; // 80% de altura máxima
            const x = index * barWidth;
            const y = (height - barHeight) / 2;
            
            // Dibujar barra centrada
            ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
        });
        
        // Dibujar línea de posición actual
        this.updatePlayhead(deck);
        
        // 🆕 Dibujar cue points existentes con soporte de zoom
        deckData.cuePoints.forEach((cuePoint, index) => {
            if (cuePoint !== null) {
                // Calcular posición relativa al rango visible
                const relativePosition = (cuePoint - startTime) / visibleDuration;
                
                // Solo dibujar si el cue point está visible en el rango actual
                if (relativePosition >= 0 && relativePosition <= 1) {
                    const x = relativePosition * width;
                    
                    // Configurar estilo para cue point
                    ctx.strokeStyle = `hsl(${index * 90}, 100%, 50%)`; // Colores diferentes
                    ctx.lineWidth = 2;
                    ctx.fillStyle = ctx.strokeStyle;
                    
                    // Dibujar línea vertical
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                    
                    // Dibujar número de cue point
                    ctx.font = 'bold 12px monospace';
                    ctx.fillText(`${index + 1}`, x + 3, 15);
                    
                    // Dibujar triángulo indicador
                    ctx.beginPath();
                    ctx.moveTo(x - 5, 0);
                    ctx.lineTo(x + 5, 0);
                    ctx.lineTo(x, 10);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        });
        
        console.log(`🎨 Waveform optimizado para Deck ${deck}: ${data.length} → ${downsampled.length} puntos`);
    }

    // 🆕 Update waveform with cue points visualization
    updateWaveformCues(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const canvas = deck === 'A' ? this.elements.waveformA : this.elements.waveformB;
        const ctx = deck === 'A' ? this.waveformCtxA : this.waveformCtxB;
        
        if (!canvas || !ctx || !deckData.audioBuffer) return;
        
        // Redibujar waveform base
        this.drawWaveform(deck);
        
        // Dibujar cue points
        const width = canvas.width;
        const height = canvas.height;
        
        deckData.cuePoints.forEach((cuePoint, index) => {
            if (cuePoint !== null) {
                const x = (cuePoint / deckData.duration) * width;
                
                // Configurar estilo para cue point
                ctx.strokeStyle = `hsl(${index * 90}, 100%, 50%)`; // Colores diferentes
                ctx.lineWidth = 2;
                ctx.fillStyle = ctx.strokeStyle;
                
                // Dibujar línea vertical
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
                
                // Dibujar número de cue point
                ctx.font = 'bold 12px monospace';
                ctx.fillText(`${index + 1}`, x + 3, 15);
                
                // Dibujar triángulo indicador
                ctx.beginPath();
                ctx.moveTo(x - 5, 0);
                ctx.lineTo(x + 5, 0);
                ctx.lineTo(x, 10);
                ctx.closePath();
                ctx.fill();
            }
        });
        
        // Actualizar playhead después de dibujar cues
        this.updatePlayhead(deck);
    }

    detectBPM(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const bpmEl = deck === 'A' ? this.elements.trackArtistA : this.elements.trackArtistB;
        
        // BPM simulado por ahora - implementar detección real más tarde
        const simulatedBPM = 120 + Math.floor(Math.random() * 40);
        deckData.bpm = simulatedBPM;
        
        if (bpmEl) {
            bpmEl.textContent = `${deckData.bpm} BPM`;
        }
        
        // Actualizar master BPM usando el nuevo método
        this.updateMasterBPM();
    }

    connectDeckToMaster(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        // Conectar el analyser al crossfader gain
        deckData.analyser.connect(deckData.crossfaderGain);
        
        // Aplicar configuración inicial del crossfader
        this.updateCrossfader();
    }

    updateCrossfader() {
        const crossfaderValue = this.crossfader; // 0 = full A, 1 = full B, 0.5 = center
        
        // 🆕 Visual feedback para crossfader
        if (this.elements.crossfader) {
            this.setSliderActive(this.elements.crossfader, crossfaderValue !== 0.5);
        }
        
        // Calcular ganancias según la curva seleccionada
        let gainA, gainB;
        
        // Aplicar curva de crossfader
        switch (this.crossfaderCurve) {
            case 'linear':
                // Curva lineal - transición suave y proporcional
                if (crossfaderValue <= 0.5) {
                    gainA = 1.0;
                    gainB = crossfaderValue * 2;
                } else {
                    gainA = (1 - crossfaderValue) * 2;
                    gainB = 1.0;
                }
                break;
                
            case 'power':
                // Curva de potencia - más suave en el centro, más abrupta en los extremos
                if (crossfaderValue <= 0.5) {
                    gainA = 1.0;
                    gainB = Math.pow(crossfaderValue * 2, 2);
                } else {
                    gainA = Math.pow((1 - crossfaderValue) * 2, 2);
                    gainB = 1.0;
                }
                break;
                
            case 'cut':
                // Curva de corte - transición abrupta para scratch/hip-hop
                if (crossfaderValue <= 0.5) {
                    gainA = 1.0;
                    gainB = crossfaderValue < 0.45 ? 0 : (crossfaderValue - 0.45) * 20;
                } else {
                    gainA = crossfaderValue > 0.55 ? 0 : (0.55 - crossfaderValue) * 20;
                    gainB = 1.0;
                }
                break;
                
            case 'smooth':
                // Curva suave en S - transición natural para mixing
                const smoothValue = Math.sin((crossfaderValue - 0.5) * Math.PI) * 0.5 + 0.5;
                if (crossfaderValue <= 0.5) {
                    gainA = 1.0;
                    gainB = smoothValue;
                } else {
                    gainA = 1 - smoothValue;
                    gainB = 1.0;
                }
                break;
                
            default:
                // Por defecto, curva lineal
                if (crossfaderValue <= 0.5) {
                    gainA = 1.0;
                    gainB = crossfaderValue * 2;
                } else {
                    gainA = (1 - crossfaderValue) * 2;
                    gainB = 1.0;
                }
                break;
        }
        
        // Aplicar ganancias a los crossfader gains
        if (this.deckA.crossfaderGain) {
            this.deckA.crossfaderGain.gain.value = gainA * this.deckA.volume;
        }
        if (this.deckB.crossfaderGain) {
            this.deckB.crossfaderGain.gain.value = gainB * this.deckB.volume;
        }
        
        // Actualizar UI visual del crossfader
        if (this.elements.crossfader) {
            const percentage = crossfaderValue * 100;
            this.elements.crossfader.value = percentage;
        }
        
        console.log(`🎛️ Crossfader (${this.crossfaderCurve}): A=${gainA.toFixed(2)}, B=${gainB.toFixed(2)}`);
    }

    // 🆕 CROSSFADER CURVE VISUALIZATION
    drawCurvePreview() {
        const canvas = this.elements.curvePreview;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Dibujar fondo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        
        // Dibujar grid
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.lineWidth = 1;
        
        // Líneas verticales
        for (let i = 0; i <= 4; i++) {
            const x = (width / 4) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Líneas horizontales
        for (let i = 0; i <= 2; i++) {
            const y = (height / 2) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Dibujar curva actual
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x <= width; x++) {
            const crossfaderValue = x / width;
            let gainA, gainB;
            
            // Calcular ganancias según la curva
            switch (this.crossfaderCurve) {
                case 'linear':
                    if (crossfaderValue <= 0.5) {
                        gainA = 1.0;
                        gainB = crossfaderValue * 2;
                    } else {
                        gainA = (1 - crossfaderValue) * 2;
                        gainB = 1.0;
                    }
                    break;
                    
                case 'power':
                    if (crossfaderValue <= 0.5) {
                        gainA = 1.0;
                        gainB = Math.pow(crossfaderValue * 2, 2);
                    } else {
                        gainA = Math.pow((1 - crossfaderValue) * 2, 2);
                        gainB = 1.0;
                    }
                    break;
                    
                case 'cut':
                    if (crossfaderValue <= 0.5) {
                        gainA = 1.0;
                        gainB = crossfaderValue < 0.45 ? 0 : (crossfaderValue - 0.45) * 20;
                    } else {
                        gainA = crossfaderValue > 0.55 ? 0 : (0.55 - crossfaderValue) * 20;
                        gainB = 1.0;
                    }
                    break;
                    
                case 'smooth':
                    const smoothValue = Math.sin((crossfaderValue - 0.5) * Math.PI) * 0.5 + 0.5;
                    if (crossfaderValue <= 0.5) {
                        gainA = 1.0;
                        gainB = smoothValue;
                    } else {
                        gainA = 1 - smoothValue;
                        gainB = 1.0;
                    }
                    break;
                    
                default:
                    if (crossfaderValue <= 0.5) {
                        gainA = 1.0;
                        gainB = crossfaderValue * 2;
                    } else {
                        gainA = (1 - crossfaderValue) * 2;
                        gainB = 1.0;
                    }
                    break;
            }
            
            // Dibujar curva para Deck A (invertida)
            const yA = height - (gainA * height);
            if (x === 0) {
                ctx.moveTo(x, yA);
            } else {
                ctx.lineTo(x, yA);
            }
        }
        
        ctx.stroke();
        
        // Dibujar curva para Deck B
        ctx.strokeStyle = '#00ffff';
        ctx.beginPath();
        
        for (let x = 0; x <= width; x++) {
            const crossfaderValue = x / width;
            let gainB;
            
            switch (this.crossfaderCurve) {
                case 'linear':
                    if (crossfaderValue <= 0.5) {
                        gainB = crossfaderValue * 2;
                    } else {
                        gainB = 1.0;
                    }
                    break;
                    
                case 'power':
                    if (crossfaderValue <= 0.5) {
                        gainB = Math.pow(crossfaderValue * 2, 2);
                    } else {
                        gainB = 1.0;
                    }
                    break;
                    
                case 'cut':
                    if (crossfaderValue <= 0.5) {
                        gainB = crossfaderValue < 0.45 ? 0 : (crossfaderValue - 0.45) * 20;
                    } else {
                        gainB = 1.0;
                    }
                    break;
                    
                case 'smooth':
                    const smoothValue = Math.sin((crossfaderValue - 0.5) * Math.PI) * 0.5 + 0.5;
                    if (crossfaderValue <= 0.5) {
                        gainB = smoothValue;
                    } else {
                        gainB = 1.0;
                    }
                    break;
                    
                default:
                    if (crossfaderValue <= 0.5) {
                        gainB = crossfaderValue * 2;
                    } else {
                        gainB = 1.0;
                    }
                    break;
            }
            
            const yB = height - (gainB * height);
            if (x === 0) {
                ctx.moveTo(x, yB);
            } else {
                ctx.lineTo(x, yB);
            }
        }
        
        ctx.stroke();
        
        // Dibujar etiquetas
        ctx.fillStyle = '#ffff00';
        ctx.font = '8px monospace';
        ctx.fillText('A', 2, 10);
        ctx.fillStyle = '#00ffff';
        ctx.fillText('B', 2, height - 2);
        
        // Dibujar posición actual del crossfader
        const currentX = this.crossfader * width;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, height);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    updateMasterVolume() {
        console.log(`🎛️ Master Volume: ${this.masterVolume}`);
        
        // 🆕 Visual feedback para master volume slider
        if (this.elements.masterVolume) {
            this.setSliderActive(this.elements.masterVolume, this.masterVolume !== 1);
        }
        
        // Aplicar volumen al master gain node
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
        
        // Actualizar display
        if (this.elements.masterVolumeDisplay) {
            this.elements.masterVolumeDisplay.textContent = `${Math.round(this.masterVolume * 100)}%`;
        }
    }

    // 🆕 EQ VISUALIZATION
    drawEQCurve(deck) {
        const ctx = deck === 'A' ? this.eqVisualizerCtxA : this.eqVisualizerCtxB;
        const canvas = deck === 'A' ? this.elements.eqVisualizerA : this.elements.eqVisualizerB;
        
        if (!ctx || !canvas) return;
        
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const width = canvas.width;
        const height = canvas.height;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Configurar estilo
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        
        // Calcular respuesta de frecuencia
        const frequencies = [];
        const gains = [];
        
        // Generar puntos para la curva de respuesta
        for (let i = 0; i <= width; i++) {
            const freq = 20 * Math.pow(1000, i / width); // 20Hz a 20kHz en escala logarítmica
            frequencies.push(freq);
            
            // Calcular ganancia total en esta frecuencia
            let totalGain = 0;
            
            // Low shelf filter contribution
            const lowFreq = deckData.eqFilters.low.frequency.value;
            const lowGain = deckData.eq.low;
            const lowSlope = 1; // Simplificado
            if (freq <= lowFreq * 4) {
                totalGain += lowGain * (1 - Math.log(freq / lowFreq) / Math.log(4));
            }
            
            // Mid peaking filter contribution
            const midFreq = deckData.eqFilters.mid.frequency.value;
            const midGain = deckData.eq.mid;
            const midQ = deckData.eqFilters.mid.Q.value;
            const midWidth = midFreq / midQ;
            if (freq >= midFreq / 2 && freq <= midFreq * 2) {
                const midResponse = Math.exp(-Math.pow(Math.log(freq / midFreq) / (midWidth / midFreq), 2));
                totalGain += midGain * midResponse;
            }
            
            // High shelf filter contribution
            const highFreq = deckData.eqFilters.high.frequency.value;
            const highGain = deckData.eq.high;
            if (freq >= highFreq / 4) {
                totalGain += highGain * (1 - Math.log(highFreq / freq) / Math.log(4));
            }
            
            gains.push(totalGain);
        }
        
        // Dibujar la curva
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        for (let i = 0; i <= width; i++) {
            const x = i;
            const normalizedGain = gains[i] / 20; // Normalizar a -1..+1
            const y = height / 2 - (normalizedGain * height * 0.4); // Escalar al canvas
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        // Completar el área bajo la curva
        ctx.lineTo(width, height / 2);
        ctx.lineTo(0, height / 2);
        ctx.closePath();
        
        // Dibujar relleno y borde
        ctx.fill();
        ctx.stroke();
        
        // Dibujar línea central (0dB)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Dibujar etiquetas de frecuencia
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px monospace';
        ctx.fillText('20Hz', 5, height - 5);
        ctx.fillText('200Hz', width * 0.3, height - 5);
        ctx.fillText('2kHz', width * 0.6, height - 5);
        ctx.fillText('20kHz', width - 35, height - 5);
    }

    updateEQ(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        console.log(`🎛️ EQ ${deck}:`, deckData.eq);
        
        // 🆕 Visual feedback para EQ sliders
        const lowSlider = deck === 'A' ? this.elements.eqLowA : this.elements.eqLowB;
        const midSlider = deck === 'A' ? this.elements.eqMidA : this.elements.eqMidB;
        const highSlider = deck === 'A' ? this.elements.eqHighA : this.elements.eqHighB;
        
        if (lowSlider) this.setSliderActive(lowSlider, deckData.eq.low !== 0);
        if (midSlider) this.setSliderActive(midSlider, deckData.eq.mid !== 0);
        if (highSlider) this.setSliderActive(highSlider, deckData.eq.high !== 0);
        
        // 🆕 Dibujar curva de EQ actualizada
        this.drawEQCurve(deck);
        
        // Aplicar valores a los filtros de audio
        if (deckData.eqFilters.low) {
            deckData.eqFilters.low.gain.value = deckData.eq.low;
        }
        if (deckData.eqFilters.mid) {
            deckData.eqFilters.mid.gain.value = deckData.eq.mid;
        }
        if (deckData.eqFilters.high) {
            deckData.eqFilters.high.gain.value = deckData.eq.high;
        }
        
        // Actualizar sliders y displays
        if (deck === 'A') {
            if (this.elements.eqLowA) {
                this.elements.eqLowA.value = deckData.eq.low;
                const valueEl = document.getElementById('eqLowValueA');
                if (valueEl) valueEl.textContent = deckData.eq.low.toFixed(0);
            }
            if (this.elements.eqMidA) {
                this.elements.eqMidA.value = deckData.eq.mid;
                const valueEl = document.getElementById('eqMidValueA');
                if (valueEl) valueEl.textContent = deckData.eq.mid.toFixed(0);
            }
            if (this.elements.eqHighA) {
                this.elements.eqHighA.value = deckData.eq.high;
                const valueEl = document.getElementById('eqHighValueA');
                if (valueEl) valueEl.textContent = deckData.eq.high.toFixed(0);
            }
        } else {
            if (this.elements.eqLowB) {
                this.elements.eqLowB.value = deckData.eq.low;
                const valueEl = document.getElementById('eqLowValueB');
                if (valueEl) valueEl.textContent = deckData.eq.low.toFixed(0);
            }
            if (this.elements.eqMidB) {
                this.elements.eqMidB.value = deckData.eq.mid;
                const valueEl = document.getElementById('eqMidValueB');
                if (valueEl) valueEl.textContent = deckData.eq.mid.toFixed(0);
            }
            if (this.elements.eqHighB) {
                this.elements.eqHighB.value = deckData.eq.high;
                const valueEl = document.getElementById('eqHighValueB');
                if (valueEl) valueEl.textContent = deckData.eq.high.toFixed(0);
            }
        }
    }

    updateTempo(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        console.log(`🎛️ Tempo ${deck}: ${deckData.tempo}x`);
        
        // 🆕 Visual feedback para tempo slider
        const tempoSlider = deck === 'A' ? this.elements.tempoA : this.elements.tempoB;
        if (tempoSlider) this.setSliderActive(tempoSlider, deckData.tempo !== 1);
        
        // Actualizar tempo del source si está reproduciendo
        if (deckData.source && deckData.isPlaying) {
            deckData.source.playbackRate.value = deckData.tempo;
        }
        
        // Actualizar display si existe
        const tempoDisplay = deck === 'A' ? this.elements.tempoDisplayA : this.elements.tempoDisplayB;
        if (tempoDisplay) {
            tempoDisplay.textContent = `${(deckData.tempo * 100).toFixed(0)}%`;
        }
    }

    updateDeckStatus(deck, statusText, ledClass) {
        const statusEl = deck === 'A' ? this.elements.deckAStatus : this.elements.deckBStatus;
        const ledEl = deck === 'A' ? this.elements.deckALedIndicator : this.elements.deckBLedIndicator;
        
        if (statusEl) {
            statusEl.textContent = statusText;
            
            // Actualizar colores según estado
            statusEl.className = 'deck-status'; // Reset classes
            ledEl.className = 'led-indicator'; // Reset classes
            
            switch(statusText) {
                case 'PLAYING':
                    statusEl.style.background = 'rgba(0,255,0,0.3)';
                    statusEl.style.borderColor = '#00ff00';
                    statusEl.style.color = '#00ff00';
                    ledEl.classList.add('playing');
                    break;
                case 'PAUSED':
                    statusEl.style.background = 'rgba(255,255,0,0.2)';
                    statusEl.style.borderColor = '#ffff00';
                    statusEl.style.color = '#ffff00';
                    ledEl.classList.add('paused');
                    break;
                case 'STOPPED':
                default:
                    statusEl.style.background = 'rgba(255,0,0,0.2)';
                    statusEl.style.borderColor = '#ff0000';
                    statusEl.style.color = '#ff0000';
                    // LED rojo es el estado por defecto
                    break;
            }
        }
    }

    updateVolume(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        console.log(`🎛️ Volume ${deck}: ${deckData.volume}`);
        
        // 🆕 Visual feedback para volume slider
        const volumeSlider = deck === 'A' ? this.elements.volumeA : this.elements.volumeB;
        if (volumeSlider) this.setSliderActive(volumeSlider, deckData.volume !== 1);
        
        // Aplicar volumen al deck gain node
        if (deckData.gainNode) {
            deckData.gainNode.gain.value = deckData.volume;
        }
        
        // Actualizar display
        const volumeDisplay = deck === 'A' ? this.elements.volumeDisplayA : this.elements.volumeDisplayB;
        if (volumeDisplay) {
            volumeDisplay.textContent = `${Math.round(deckData.volume * 100)}%`;
        }
        
        // Actualizar crossfader para aplicar el nuevo volumen
        this.updateCrossfader();
    }

    syncBPM(sourceDeck, targetDeck) {
        const sourceData = sourceDeck === 'A' ? this.deckA : this.deckB;
        const targetData = targetDeck === 'A' ? this.deckA : this.deckB;
        
        if (!sourceData.bpm || !targetData.audioBuffer) {
            console.log(`❌ No se puede sincronizar BPM: Deck ${sourceDeck} no tiene BPM o Deck ${targetDeck} no tiene track`);
            return;
        }
        
        // 🆕 Visual feedback para botón de sync
        const syncButton = document.getElementById(`sync${sourceDeck}to${targetDeck}`);
        if (syncButton) this.flashButton(syncButton, 300);
        
        // Calcular el tempo necesario para igualar BPMs
        const sourceBPM = sourceData.bpm;
        const targetOriginalBPM = targetData.bpm;
        const tempoMultiplier = sourceBPM / targetOriginalBPM;
        
        // Limitar el tempo a un rango razonable (50% - 200%)
        const clampedTempo = Math.max(0.5, Math.min(2.0, tempoMultiplier));
        
        // Aplicar el tempo al deck objetivo
        targetData.tempo = clampedTempo;
        
        // Actualizar el slider y display
        const tempoSlider = targetDeck === 'A' ? this.elements.tempoA : this.elements.tempoB;
        const tempoDisplay = targetDeck === 'A' ? this.elements.tempoDisplayA : this.elements.tempoDisplayB;
        
        if (tempoSlider) {
            tempoSlider.value = clampedTempo * 100;
        }
        
        if (tempoDisplay) {
            tempoDisplay.textContent = `${(clampedTempo * 100).toFixed(0)}%`;
        }
        
        // Actualizar BPM del deck objetivo
        targetData.bpm = sourceBPM;
        
        // Actualizar displays de BPM
        const targetArtistEl = targetDeck === 'A' ? this.elements.trackArtistA : this.elements.trackArtistB;
        if (targetArtistEl) {
            targetArtistEl.textContent = `${targetData.bpm} BPM`;
        }
        
        // Actualizar master BPM
        this.updateMasterBPM();
        
        // Verificar beat sync después de sincronizar
        this.checkBeatSync();
        
        // Actualizar display de sincronización
        const syncDisplay = document.getElementById('bpmSyncDisplay');
        if (syncDisplay) {
            syncDisplay.textContent = `BPM: ${sourceBPM} (SYNCED)`;
            syncDisplay.style.color = '#00ff00';
            
            // Resetear el color después de 2 segundos
            setTimeout(() => {
                syncDisplay.style.color = '#ffff00';
                syncDisplay.textContent = `BPM: ${sourceBPM}`;
            }, 2000);
        }
        
        console.log(`🔄 BPM sincronizado: Deck ${sourceDeck} (${sourceBPM}) → Deck ${targetDeck} (${targetData.bpm})`);
    }

    updateMasterBPM() {
        // Calcular master BPM promedio
        if (this.deckA.bpm && this.deckB.bpm) {
            this.masterBpm = Math.round((this.deckA.bpm + this.deckB.bpm) / 2);
        } else if (this.deckA.bpm) {
            this.masterBpm = this.deckA.bpm;
        } else if (this.deckB.bpm) {
            this.masterBpm = this.deckB.bpm;
        }
        
        // Actualizar display
        if (this.elements.masterBpm) {
            this.elements.masterBpm.textContent = `MASTER BPM: ${this.masterBpm}`;
        }
    }

    startBeatMatching(deck) {
        if (!this.beatMatching.enabled) return;
        
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        if (!deckData.isPlaying || !deckData.bpm) return;
        
        // Calcular intervalo de beat basado en BPM
        const beatInterval = 60000 / deckData.bpm; // milisegundos por beat
        
        if (deck === 'A') {
            this.beatMatching.beatIntervalA = beatInterval;
            this.startBeatIndicator('A');
        } else {
            this.beatMatching.beatIntervalB = beatInterval;
            this.startBeatIndicator('B');
        }
        
        this.checkBeatSync();
    }

    stopBeatMatching(deck) {
        if (deck === 'A') {
            if (this.beatMatching.beatTimerA) {
                clearInterval(this.beatMatching.beatTimerA);
                this.beatMatching.beatTimerA = null;
            }
            this.stopBeatIndicator('A');
        } else {
            if (this.beatMatching.beatTimerB) {
                clearInterval(this.beatMatching.beatTimerB);
                this.beatMatching.beatTimerB = null;
            }
            this.stopBeatIndicator('B');
        }
        
        this.checkBeatSync();
    }

    startBeatIndicator(deck) {
        const beatLight = document.querySelector(`#beatIndicator${deck} .beat-light`);
        if (!beatLight) return;
        
        const interval = deck === 'A' ? this.beatMatching.beatIntervalA : this.beatMatching.beatIntervalB;
        
        if (deck === 'A') {
            this.beatMatching.beatTimerA = setInterval(() => {
                beatLight.classList.add('active');
                setTimeout(() => beatLight.classList.remove('active'), 100);
            }, interval);
        } else {
            this.beatMatching.beatTimerB = setInterval(() => {
                beatLight.classList.add('active');
                setTimeout(() => beatLight.classList.remove('active'), 100);
            }, interval);
        }
    }

    stopBeatIndicator(deck) {
        const beatLight = document.querySelector(`#beatIndicator${deck} .beat-light`);
        if (beatLight) {
            beatLight.classList.remove('active');
        }
    }

    checkBeatSync() {
        const syncStatus = document.getElementById('syncStatus');
        if (!syncStatus) return;
        
        const bothPlaying = this.deckA.isPlaying && this.deckB.isPlaying;
        const bothHaveBPM = this.deckA.bpm && this.deckB.bpm;
        
        if (!bothPlaying || !bothHaveBPM) {
            syncStatus.textContent = 'NO SYNC';
            syncStatus.className = 'sync-status';
            return;
        }
        
        // Calcular diferencia de BPM
        const bpmDiff = Math.abs(this.deckA.bpm - this.deckB.bpm);
        const bpmRatio = Math.min(this.deckA.bpm, this.deckB.bpm) / Math.max(this.deckA.bpm, this.deckB.bpm);
        
        if (bpmDiff <= 1) {
            // Perfect sync
            syncStatus.textContent = 'SYNCED';
            syncStatus.className = 'sync-status synced';
        } else if (bpmRatio >= 0.95) {
            // Close sync
            syncStatus.textContent = 'CLOSE';
            syncStatus.className = 'sync-status close';
        } else {
            // No sync
            syncStatus.textContent = 'NO SYNC';
            syncStatus.className = 'sync-status';
        }
    }

    toggleCuePoint(deck, cueNumber) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const cueBtn = document.getElementById(`cue${cueNumber}${deck}`);
        
        if (!deckData.audioBuffer) return;
        
        // 🆕 Visual feedback para botón de cue
        if (cueBtn) this.flashButton(cueBtn, 200);
        
        if (deckData.cuePoints[cueNumber - 1] === null) {
            // Set cue point
            deckData.cuePoints[cueNumber - 1] = deckData.currentTime;
            if (cueBtn) {
                cueBtn.classList.add('active');
                cueBtn.textContent = `CUE${cueNumber}`;
            }
            console.log(`📍 Cue ${cueNumber} set en Deck ${deck}: ${deckData.currentTime.toFixed(2)}s`);
        } else {
            // Clear cue point
            deckData.cuePoints[cueNumber - 1] = null;
            if (cueBtn) {
                cueBtn.classList.remove('active');
                cueBtn.textContent = `CUE${cueNumber}`;
            }
            console.log(`🗑️ Cue ${cueNumber} cleared en Deck ${deck}`);
        }
    }

    // Inicialización
    async init() {
        console.log(' Inicializando DJ Console...');
        
        // Crear audio context
        this.audioContext = null;
        
        // EQ Visualizer contexts
        this.eqVisualizerCtxA = null;
        this.eqVisualizerCtxB = null;
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 🆕 Inicializar preview de curvas de crossfader
        this.drawCurvePreview();
        
        // Crear master nodes para crossfader
        this.masterGainNode = this.audioContext.createGain();
        this.masterGainNode.gain.value = this.masterVolume;
        
        // Crear gain nodes para cada deck (para crossfader)
        this.deckA.crossfaderGain = this.audioContext.createGain();
        this.deckB.crossfaderGain = this.audioContext.createGain();
        
        // Crear filtros EQ para Deck A
        this.deckA.eqFilters = { low: null, mid: null, high: null };
        this.deckB.eqFilters = { low: null, mid: null, high: null };
        
        // Spectrum analyzers
        this.deckA.spectrumAnalyzer = null;
        this.deckB.spectrumAnalyzer = null;
        
        this.deckA.eqFilters.low = this.audioContext.createBiquadFilter();
        this.deckA.eqFilters.low.type = 'lowshelf';
        this.deckA.eqFilters.low.frequency.value = 320;
        
        this.deckA.eqFilters.mid = this.audioContext.createBiquadFilter();
        this.deckA.eqFilters.mid.type = 'peaking';
        this.deckA.eqFilters.mid.frequency.value = 1000;
        this.deckA.eqFilters.mid.Q.value = 0.5;
        
        this.deckA.eqFilters.high = this.audioContext.createBiquadFilter();
        this.deckA.eqFilters.high.type = 'highshelf';
        this.deckA.eqFilters.high.frequency.value = 3200;
        
        // Crear filtros EQ para Deck B
        this.deckB.eqFilters.low = this.audioContext.createBiquadFilter();
        this.deckB.eqFilters.low.type = 'lowshelf';
        this.deckB.eqFilters.low.frequency.value = 320;
        
        this.deckB.eqFilters.mid = this.audioContext.createBiquadFilter();
        this.deckB.eqFilters.mid.type = 'peaking';
        this.deckB.eqFilters.mid.frequency.value = 1000;
        this.deckB.eqFilters.mid.Q.value = 0.5;
        
        this.deckB.eqFilters.high = this.audioContext.createBiquadFilter();
        this.deckB.eqFilters.high.type = 'highshelf';
        this.deckB.eqFilters.high.frequency.value = 3200;
        
        // 🆕 Crear analizadores de espectro
        this.deckA.spectrumAnalyzer = this.audioContext.createAnalyser();
        this.deckA.spectrumAnalyzer.fftSize = 256;
        this.deckA.spectrumAnalyzer.smoothingTimeConstant = 0.8;
        
        this.deckB.spectrumAnalyzer = this.audioContext.createAnalyser();
        this.deckB.spectrumAnalyzer.fftSize = 256;
        this.deckB.spectrumAnalyzer.smoothingTimeConstant = 0.8;
        
        // Conectar crossfader gains al master
        this.deckA.crossfaderGain.connect(this.masterGainNode);
        this.deckB.crossfaderGain.connect(this.masterGainNode);
        
        // Conectar master al destino
        this.masterGainNode.connect(this.audioContext.destination);
        
        // Crear estructura HTML
        this.createConsole();
        
        // Cache de elementos
        this.cacheElements();
        
        // Aplicar estilos
        this.applyTechnoStyling();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Inicializar canvas contexts
        if (this.elements.waveformA) {
            this.waveformCtxA = this.elements.waveformA.getContext('2d');
        }
        if (this.elements.waveformB) {
            this.waveformCtxB = this.elements.waveformB.getContext('2d');
        }
        
        // 🆕 Inicializar EQ visualizer contexts
        if (this.elements.eqVisualizerA) {
            this.eqVisualizerCtxA = this.elements.eqVisualizerA.getContext('2d');
        }
        if (this.elements.eqVisualizerB) {
            this.eqVisualizerCtxB = this.elements.eqVisualizerB.getContext('2d');
        }
        
        console.log('✅ DJ Console inicializado');
        
        // Cargar tracks automáticamente para demostración
        setTimeout(() => {
            this.loadTrackForDeck('A', '/Music/track1.mp3');
            this.loadTrackForDeck('B', '/Music/mereconozco.mp3');
        }, 1000);
        
        // 🆕 Inicializar deck activo visualmente
        setTimeout(() => {
            this.switchActiveDeck(); // Esto establecerá Deck A como activo visualmente
            console.log('⌨️ Presiona H para ver todos los atajos de teclado');
        }, 1500);
    }
}

// Inicializar la DJ Console cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎛️ DOM listo, creando DJ Console...');
    
    // Crear la estructura HTML de la consola
    const djConsole = new DJConsole();
    await djConsole.init();
    
    // Hacer global para debugging
    window.djConsole = djConsole;
    
    console.log('✅ DJ Console lista para usar');
});
