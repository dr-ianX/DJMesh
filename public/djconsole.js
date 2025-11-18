// 🎛️ DJ CONSOLE PROFESIONAL - VERSIÓN MEJORADA
// Consola de DJ optimizada para DJMesh

class DJConsole {
    constructor() {
        // Inicializar propiedades básicas
        this.audioContext = null;
        
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
            tempo: 1.0,
            cuePoints: [null, null, null, null],
            hotCues: [null, null, null, null]
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
            tempo: 1.0,
            cuePoints: [null, null, null, null],
            hotCues: [null, null, null, null]
        };
        
        // Master controls
        this.crossfader = 0.5;
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
                        </div>
                        <div class="eq-band">
                            <label>MID</label>
                            <input type="range" id="eqMidA" min="-20" max="20" value="0" class="eq-slider">
                            <span id="eqMidValueA">0</span>
                        </div>
                        <div class="eq-band">
                            <label>HIGH</label>
                            <input type="range" id="eqHighA" min="-20" max="20" value="0" class="eq-slider">
                            <span id="eqHighValueA">0</span>
                        </div>
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
                        </div>
                        <div class="eq-band">
                            <label>MID</label>
                            <input type="range" id="eqMidB" min="-20" max="20" value="0" class="eq-slider">
                            <span id="eqMidValueB">0</span>
                        </div>
                        <div class="eq-band">
                            <label>HIGH</label>
                            <input type="range" id="eqHighB" min="-20" max="20" value="0" class="eq-slider">
                            <span id="eqHighValueB">0</span>
                        </div>
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
        this.elements.eqLowA = document.getElementById('eqLowA');
        this.elements.eqMidA = document.getElementById('eqMidA');
        this.elements.eqHighA = document.getElementById('eqHighA');
        this.elements.tempoA = document.getElementById('tempoA');
        this.elements.tempoDisplayA = document.getElementById('tempoDisplayA');
        this.elements.volumeA = document.getElementById('volumeA');
        this.elements.volumeDisplayA = document.getElementById('volumeDisplayA');
        this.elements.trackSelectA = document.getElementById('trackSelectA');
        this.elements.loadTrackA = document.getElementById('loadTrackA');
        
        // Deck A Status
        this.elements.deckAStatus = document.getElementById('deckAStatus');
        this.elements.deckALedIndicator = document.getElementById('deckALedIndicator');
        
        // VU Meters
        this.elements.vuMeterA = document.getElementById('vuMeterA');
        this.elements.vuMeterBarA = document.getElementById('vuMeterBarA');
        this.elements.vuMeterB = document.getElementById('vuMeterB');
        this.elements.vuMeterBarB = document.getElementById('vuMeterBarB');
        
        // Waveforms
        this.elements.waveformA = document.getElementById('waveformA');
        this.elements.waveformB = document.getElementById('waveformB');
        this.elements.playheadA = document.getElementById('playheadA');
        this.elements.playheadB = document.getElementById('playheadB');
        
        // Transport controls Deck A
        this.elements.playA = document.getElementById('playA');
        this.elements.pauseA = document.getElementById('pauseA');
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
        this.elements.eqLowB = document.getElementById('eqLowB');
        this.elements.eqMidB = document.getElementById('eqMidB');
        this.elements.eqHighB = document.getElementById('eqHighB');
        this.elements.tempoB = document.getElementById('tempoB');
        this.elements.tempoDisplayB = document.getElementById('tempoDisplayB');
        this.elements.volumeB = document.getElementById('volumeB');
        this.elements.volumeDisplayB = document.getElementById('volumeDisplayB');
        this.elements.trackSelectB = document.getElementById('trackSelectB');
        this.elements.loadTrackB = document.getElementById('loadTrackB');
        
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
                const trackSelect = this.elements.trackSelectA.value;
                if (trackSelect) {
                    this.loadTrackForDeck('A', `/Music/${trackSelect}.mp3`);
                }
            });
        }

        if (this.elements.loadTrackB) {
            this.elements.loadTrackB.addEventListener('click', () => {
                const trackSelect = this.elements.trackSelectB.value;
                if (trackSelect) {
                    this.loadTrackForDeck('B', `/Music/${trackSelect}.mp3`);
                }
            });
        }

        // Crossfader y Master
        if (this.elements.crossfader) {
            this.elements.crossfader.addEventListener('input', (e) => {
                this.crossfader = parseFloat(e.target.value) / 100;
                this.updateCrossfader();
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
        }
        if (this.elements.waveformB) {
            this.elements.waveformB.addEventListener('click', (e) => this.handleWaveformClick('B', e));
        }

        console.log('✅ Event listeners configurados para 2 decks');
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
            deckData.currentTrack = trackUrl;
            
            this.updateTimeDisplay(deck);
            this.detectBPM(deck);
            this.drawWaveform(deck);

            console.log(`✅ Track cargado en Deck ${deck}:`, trackName);
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

        // Crear nuevo source
        deckData.source = this.audioContext.createBufferSource();
        deckData.source.buffer = deckData.audioBuffer;
        
        // Crear nodes de audio
        deckData.gainNode = this.audioContext.createGain();
        deckData.analyser = this.audioContext.createAnalyser();
        
        // Aplicar tempo
        deckData.source.playbackRate.value = deckData.tempo;
        
        // Conectar nodes con EQ y crossfader
        deckData.source.connect(deckData.eqFilters.low);
        deckData.eqFilters.low.connect(deckData.eqFilters.mid);
        deckData.eqFilters.mid.connect(deckData.eqFilters.high);
        deckData.eqFilters.high.connect(deckData.gainNode);
        deckData.gainNode.connect(deckData.analyser);
        
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

        deckData.source.stop();
        deckData.isPlaying = false;
        
        // Detener beat matching
        this.stopBeatMatching(deck);

        // Actualizar UI
        this.updateDeckStatus(deck, 'PAUSED', 'paused');
        
        console.log(`⏸️ Deck ${deck} paused`);
    }

    stopDeck(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        
        if (deckData.source) {
            deckData.source.stop();
        }
        
        deckData.isPlaying = false;
        deckData.currentTime = 0;
        
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
        
        deckData.currentTime += 0.016 * deckData.tempo; // ~60fps
        
        if (deckData.currentTime >= deckData.duration) {
            this.stopDeck(deck);
            return;
        }
        
        this.updateTimeDisplay(deck);
        this.updatePlayhead(deck);
        this.updateVUMeters(deck);
        
        requestAnimationFrame(() => this.animateDeck(deck));
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
            const progress = (deckData.currentTime / deckData.duration) * 100;
            playheadEl.style.left = `${progress}%`;
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
            // Detener source actual
            deckData.source.stop();
            
            // Crear nuevo source desde la nueva posición
            deckData.source = this.audioContext.createBufferSource();
            deckData.source.buffer = deckData.audioBuffer;
            deckData.source.playbackRate.value = deckData.tempo;
            
            // Reconectar la cadena de audio
            deckData.source.connect(deckData.eqFilters.low);
            deckData.eqFilters.low.connect(deckData.eqFilters.mid);
            deckData.eqFilters.mid.connect(deckData.eqFilters.high);
            deckData.eqFilters.high.connect(deckData.gainNode);
            deckData.gainNode.connect(deckData.analyser);
            this.connectDeckToMaster(deck);
            
            // Iniciar desde nueva posición
            deckData.source.start(0, newTime);
        }
        
        // Actualizar UI
        this.updateTimeDisplay(deck);
        this.updatePlayhead(deck);
        
        console.log(`🎯 Deck ${deck} seek to ${this.formatTime(newTime)}`);
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
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Dibujar waveform
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#00ffff';
        ctx.beginPath();
        
        const sliceWidth = width / data.length;
        let x = 0;
        
        for (let i = 0; i < data.length; i++) {
            const v = data[i];
            const y = (v + 1) * height / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.stroke();
        
        // Dibujar línea de posición actual
        this.updatePlayhead(deck);
        
        console.log(`🎨 Waveform dibujado para Deck ${deck}`);
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

    drawWaveform(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        const canvas = deck === 'A' ? this.elements.waveformA : this.elements.waveformB;
        const ctx = deck === 'A' ? this.waveformCtxA : this.waveformCtxB;
        
        if (!canvas || !ctx || !deckData.audioBuffer) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const data = deckData.audioBuffer.getChannelData(0);
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Dibujar waveform
        ctx.fillStyle = '#00ff88';
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1;
        
        const sliceWidth = width / data.length;
        let x = 0;
        
        for (let i = 0; i < data.length; i++) {
            const v = data[i];
            const y = (v + 1) / 2 * height;
            
            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.stroke();
        
        console.log(`🌊 Waveform dibujado para Deck ${deck}`);
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
        
        // Calcular ganancias para crossfader lineal
        let gainA, gainB;
        
        if (crossfaderValue <= 0.5) {
            // Crossfader a la izquierda (Deck A dominante)
            gainA = 1.0;
            gainB = crossfaderValue * 2; // 0 a 1
        } else {
            // Crossfader a la derecha (Deck B dominante)
            gainA = (1 - crossfaderValue) * 2; // 1 a 0
            gainB = 1.0;
        }
        
        // Aplicar ganancias con curva opcional
        if (this.crossfaderCurve === 1) {
            // Curva suave (power)
            gainA = Math.sqrt(gainA);
            gainB = Math.sqrt(gainB);
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
        
        console.log(`🎛️ Crossfader: A=${gainA.toFixed(2)}, B=${gainB.toFixed(2)}`);
    }

    updateMasterVolume() {
        console.log(`🎛️ Master Volume: ${this.masterVolume}`);
        
        // Aplicar volumen al master gain node
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
        
        // Actualizar display
        if (this.elements.masterVolumeDisplay) {
            this.elements.masterVolumeDisplay.textContent = `${Math.round(this.masterVolume * 100)}%`;
        }
    }

    updateEQ(deck) {
        const deckData = deck === 'A' ? this.deckA : this.deckB;
        console.log(`🎛️ EQ ${deck}:`, deckData.eq);
        
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
        console.log('🎛️ Inicializando DJ Console...');
        
        // Crear audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Crear master nodes para crossfader
        this.masterGainNode = this.audioContext.createGain();
        this.masterGainNode.gain.value = this.masterVolume;
        
        // Crear gain nodes para cada deck (para crossfader)
        this.deckA.crossfaderGain = this.audioContext.createGain();
        this.deckB.crossfaderGain = this.audioContext.createGain();
        
        // Crear filtros EQ para Deck A
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
        
        console.log('✅ DJ Console inicializado');
        
        // Cargar tracks automáticamente para demostración
        setTimeout(() => {
            this.loadTrackForDeck('A', '/Music/track1.mp3');
            this.loadTrackForDeck('B', '/Music/mereconozco.mp3');
        }, 1000);
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
