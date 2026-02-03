import "./../assets/scss/MainScreen.scss";
import { useState, useRef, useEffect, useContext } from "react";
import { GlobalContext } from "./GlobalContext.jsx";

export default function MainScreen({ solvePuzzle, solved, solvedTrigger }) {
    const { appSettings: config } = useContext(GlobalContext);

    // Default values
    const MIN_FREQ = config.range?.min || 87.0;
    const MAX_FREQ = config.range?.max || 108.0;
    // Use a sensible default if config step is weird, typically 0.1
    const STEP = config.step || 0.1;
    const TOLERANCE = config.tolerance || 0.2;

    const [frequency, setFrequency] = useState(MIN_FREQ);
    const [volume, setVolume] = useState(0.5);
    const [displayFreq, setDisplayFreq] = useState(MIN_FREQ);

    // Audio Context & Nodes
    const audioCtxRef = useRef(null);
    const staticNodeRef = useRef(null);
    const staticGainRef = useRef(null);
    const stationNodesRef = useRef({}); // { freq: { element: Audio, gain: GainNode, source: MediaElementSource } }
    const masterGainRef = useRef(null);

    // Initialize Audio Context on first interaction or mount (handling autoplay policies)
    useEffect(() => {
        if (!config.stations) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        // Master Gain (Volume)
        const masterGain = ctx.createGain();
        masterGain.gain.value = volume;
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        // 1. Setup Static Noise (White Noise)
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const staticSource = ctx.createBufferSource();
        staticSource.buffer = buffer;
        staticSource.loop = true;

        const staticGain = ctx.createGain();
        staticGain.gain.value = 0.5; // Start with some static
        staticSource.connect(staticGain);
        staticGain.connect(masterGain);

        staticSource.start();
        staticNodeRef.current = staticSource;
        staticGainRef.current = staticGain;

        // 2. Setup Stations
        config.stations.forEach(station => {
            const audio = new Audio(station.url);
            audio.loop = true;
            audio.crossOrigin = "anonymous";

            // We need a MediaElementSource to route it through Web Audio API
            // Note: verify if this causes CORS issues. Usually fine if same domain or CORS headers present. 
            // If "actions.google.com" doesn't support CORS for web audio, this might fail. 
            // Fallback: Just control audio.volume directly without Web Audio graph for stations if simple.
            // But mixing with static is better with Web Audio.
            // Let's try direct element control for simplicity and robustness against CORS images/audio.
            // Actually, we can mix: Static via WebAudio, Stations via Audio Elements. 
            // Scaling volume is the key.

            audio.volume = 0;

            // Save ref
            stationNodesRef.current[station.freq] = { audio, config: station };
        });

        return () => {
            // Cleanup
            if (audioCtxRef.current) audioCtxRef.current.close();
            Object.values(stationNodesRef.current).forEach(n => {
                n.audio.pause();
                n.audio.src = "";
            });
        };
    }, []);

    // Handle Updates
    useEffect(() => {
        // 1. Update Master Volume on GainNode (for static) and station elements
        if (masterGainRef.current) {
            // Static volume is handled relative to signal, but master volume applies to it too?
            // Actually we can just specific static volume.
            // Let's handle mixing logic below.
        }

        let maxSignal = 0;

        // Check each station
        Object.values(stationNodesRef.current).forEach(({ audio, config }) => {
            const dist = Math.abs(frequency - config.freq);
            let signal = 0;

            if (dist < TOLERANCE) {
                // Linear fade: 1 at 0 dist, 0 at tolerance
                signal = 1 - (dist / TOLERANCE);
            }

            // Signal is the "reception quality"
            if (signal > maxSignal) maxSignal = signal;

            // Station volume = Signal * MasterVolume
            // If signal is 0, volume is 0.
            // Also if volume is very low, pause to save resources? 
            // Or just keep playing (looped). pause/play triggers are heavy.

            // Apply volume
            audio.volume = signal * volume;

            // Logic to start playing if it has volume and is paused
            if (signal > 0 && audio.paused) {
                // User interaction needed for Audio.play()? 
                // We are inside an event handler flow (usually), or effect.
                const p = audio.play();
                if (p) p.catch(() => { });
            } else if (signal === 0 && !audio.paused) {
                audio.pause();
            }

            // Check for solution?
            // If signal is strong (e.g. > 0.9) and this is the solution station
            if (signal > 0.95 && config.solution && !solved) {
                // Trigger auto-solve or just wait for user?
                // "En lugar de acertar un canal... acertar una frecuencia"
                // Usually we submit solution if they stay there?
                // Or maybe just hearing the code is enough? 
                // The user didn't specify automatic solving. Usually puzzles require submitting a code found in the audio.
                // But if "reusable puzzle... like TV", maybe the app solves itself?
                // The TV code calls `solvePuzzle`. 
                // I'll wait 2 seconds of strong signal then solve?
                // Let's assume the audio CONTAINS the solution, user solves elsewhere? 
                // But `solvePuzzle` prop is passed. 
                // Let's add a "Scan" or "Acquire" logic, or just solving if held for X seconds.
                // User said "User can change freq and volume". 
                // I'll just play the audio. If they need to 'solve', maybe a button?
                // But look at `checkResult` in `App.jsx`, it submits a solution string.
                // If the audio says "The code is 1234", user enters it somewhere? 
                // The prompt "reusable puzzle... acertar una frecuencia" might imply AUTOMATIC detection like the TV one likely did.
                // I'll implement: if (signal > 0.95 && config.solution) -> solvePuzzle(frequency).
            }
        });

        // Static Volume
        // Static is loud when maxSignal is low.
        // Static = (1 - maxSignal) * Volume * 0.5 (dampened)
        if (staticGainRef.current) { // & masterGainRef is implied
            // We apply master volume here manually since we didn't connect everyone to masterGain
            const staticVal = (1 - maxSignal) * volume * 0.3;
            staticGainRef.current.gain.setTargetAtTime(staticVal, audioCtxRef.current.currentTime, 0.1);
        }

    }, [frequency, volume, solved]); // Check reception on change

    // Check for solution stability
    useEffect(() => {
        // If we want to auto-solve when tuned to the correct frequency
        const solutionStation = config.stations?.find(s => s.solution);
        if (solutionStation && !solved) {
            if (Math.abs(frequency - solutionStation.freq) < (TOLERANCE / 4)) {
                const timer = setTimeout(() => {
                    solvePuzzle(frequency); // Pass frequency as solution
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [frequency, solved, config]);

    // Resume AudioContext on user interaction if suspended
    const handleInteraction = () => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    const calculateNeedlePosition = () => {
        // 0% -> MIN_FREQ, 100% -> MAX_FREQ
        const pct = ((frequency - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100;
        return Math.min(Math.max(pct, 0), 100);
    };

    // Determine skin class
    const skinClass = config?.skin ? `skin-${config.skin.toLowerCase()}` : 'skin-standard';

    return (
        <div className={`mainScreen ${skinClass}`} onClick={handleInteraction}>
            <div className="radio-device">
                <div className="radio-top">
                    <div className="speaker-grill"></div>
                    <div className="display-panel">
                        <div className="lcd-display">
                            {frequency.toFixed(1)} <span className="mhz">MHz</span>
                        </div>
                        <div className="scale-container">
                            <div className="scale-marks">
                                {[0, 25, 50, 75, 100].map(p => (
                                    <span key={p} style={{ fontSize: '0.8rem' }}>|</span> // Simple marks
                                ))}
                                <span style={{ position: 'absolute', left: '0%' }}>{MIN_FREQ}</span>
                                <span style={{ position: 'absolute', right: '0%' }}>{MAX_FREQ}</span>
                            </div>
                            <div className="needle" style={{ left: `${calculateNeedlePosition()}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="radio-controls">
                    <div className="control-group">
                        <label>Tuner</label>
                        <input
                            type="range"
                            min={MIN_FREQ}
                            max={MAX_FREQ}
                            step={STEP}
                            value={frequency}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setFrequency(val);
                            }}
                        />
                    </div>
                    <div className="control-group">
                        <label>Volume</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
