import React, { useState, useEffect, useRef } from 'react'; 
import Sidebar from '../components/Sidebar';
import { FaBed, FaAppleAlt, FaBrain, FaRunning, FaSun, FaMusic, FaStop, FaClock, FaUpload, FaBan, FaTint, FaPlay, FaPause, FaTimesCircle } from 'react-icons/fa'; 
import { useCallback } from "react";
// --- Sound Definitions ---
const SOUND_OPTIONS = [
    { value: 'none', label: '--- No Alarm Sound ---' },
    { value: '/sounds/chime_gentle.mp3', label: 'Gentle Chime' }, 
    { value: '/sounds/gong_soft.mp3', label: 'Soft Gong' },     
    { value: 'custom', label: 'Uploaded Song' }, 
];
const INITIAL_SETUP_TIME = 20;

// Helper to format seconds into MM:SS
const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// --- MOCK DATA (unchanged) ---
const TIPS_DATA = [
    { id: 1, title: "The 20-Minute Power Nap", category: "Sleep", icon: <FaBed />, detail: "Aim for a 20-minute nap to refresh your mind without entering deep sleep (which causes grogginess). Set a light alarm.", color: "#2980B9", duration: 1200 }, 
    { id: 2, title: "Box Breathing Technique", category: "Mindfulness", icon: <FaBrain />, detail: "Inhale slowly for 4 seconds, hold for 4, exhale for 4, and hold for 4. Repeat for five minutes to calm the nervous system.", color: "#9B59B6", duration: 300 }, 
    { id: 3, title: "Hydration Check-in", category: "Physical", icon: <FaAppleAlt />, detail: "Dehydration mimics anxiety. Keep a water bottle visible and aim for a full glass every two hours you are awake.", color: "#2ECC71", duration: 600 }, 
    { id: 4, title: "Digital Sunset", category: "Routine", icon: <FaSun />, detail: "Stop looking at screens 60 minutes before bed. This allows melatonin production to naturally prepare your body for sleep.", color: "#F39C12", duration: 3600 } 
];

// --- Wellness Card Component (unchanged) ---
const TipCard = ({ tip, onClick }) => (
    <div style={{...styles.tipCard, borderLeft: `4px solid ${tip.color}`}}>
        <div style={{...styles.tipIconWrapper, backgroundColor: tip.color}}>
            {tip.icon}
        </div>
        <h3 style={styles.tipTitle}>{tip.title}</h3>
        <span style={styles.tipCategory}>{tip.category}</span>
        <p style={styles.tipDetail}>{tip.detail}</p>
        <button 
            onClick={() => onClick(tip)} 
            style={{...styles.actionButton, backgroundColor: tip.color}}
        >
            Try Now
        </button>
    </div>
);


function WellnessPage() {
    const [mood] = useState(3); 
    const [journalEntry, setJournalEntry] = useState('');
    const [activeTips] = useState(TIPS_DATA); 
    
    // 🎯 RESTORED SOUND STATES 🎯
    const [selectedSound, setSelectedSound] = useState(SOUND_OPTIONS[1].value); 
    const [uploadedSoundUrl, setUploadedSoundUrl] = useState(null);  
    const [isAlarmActive, setIsAlarmActive] = useState(false); 
    const [customDuration, setCustomDuration] = useState(INITIAL_SETUP_TIME); 
    
    const [breathingPhase, setBreathingPhase] = useState(null); 
    const [isPaused, setIsPaused] = useState(true); 
    const [lastAudioError, setLastAudioError] = useState(null); 
    
    const audioRef = useRef(null); 
    const fileInputRef = useRef(null); 
    
    // TIMER STATE
    const [activeTimer, setActiveTimer] = useState({ 
        name: null, 
        secondsRemaining: 0,
        initialDuration: 0,
    }); 
    
    // 🎯 Use Effect 1: Load saved sound from Local Storage 🎯
    useEffect(() => {
        const savedUrl = localStorage.getItem('customAlarmUrl');
        const savedName = localStorage.getItem('customAlarmName');
        const savedSelection = localStorage.getItem('selectedAlarm');

        if (savedUrl && savedName) {
            setUploadedSoundUrl(savedUrl);
            setUploadedFileName(savedName);
            if (savedSelection === 'custom' || SOUND_OPTIONS.some(o => o.value === savedSelection)) {
                setSelectedSound(savedSelection);
            }
        } else if (savedSelection && SOUND_OPTIONS.some(o => o.value === savedSelection)) {
             setSelectedSound(savedSelection);
        }
        setLastAudioError(null); 
    }, []);

    // --- SOUND UTILITY FUNCTIONS ---

    const getCurrentSoundSource = () => {
        if (selectedSound === 'none') return null;
        return selectedSound === 'custom' && uploadedSoundUrl 
            ? uploadedSoundUrl 
            : selectedSound;
    };
    
    // Audio Unlock (Called on first user click)
    const unlockAudioContext = () => {
        if (audioRef.current) {
            const source = getCurrentSoundSource() || '/sounds/silent.mp3'; // Use a fallback silent mp3 if possible
            
            audioRef.current.src = source; 
            audioRef.current.volume = 0; 
            audioRef.current.load(); 

            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.volume = 0.5; 
            }).catch(error => {
                console.error("Audio unlock failed, fallback needed.", error);
                // Assume unlocked state, but audio file may still be missing
            });
        }
    };

    const playAlarmSound = useCallback(() => {
        const source = getCurrentSoundSource();
        if (!source || source === "none") return;

        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.src = source;
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 0.5;

            audioRef.current.play().catch(() => {
                setLastAudioError("Alarm playback blocked by browser");
            });
        }
        }, [selectedSound, uploadedSoundUrl]);
    const stopAlarm = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.loop = false;
        }
        setIsAlarmActive(false);
        setActiveTimer({ name: null, secondsRemaining: 0, initialDuration: 0 });
        setBreathingPhase(null); 
        setIsPaused(true); 
        setLastAudioError(null); 
    };

    // 🎯 NEW: File Upload Handler 🎯
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            if (uploadedSoundUrl) {
                URL.revokeObjectURL(uploadedSoundUrl);
            }
            
            const newUrl = URL.createObjectURL(file);
            localStorage.setItem('customAlarmUrl', newUrl);
            localStorage.setItem('customAlarmName', file.name);

            setUploadedSoundUrl(newUrl);
            setUploadedFileName(file.name);
            setSelectedSound('custom'); 
            localStorage.setItem('selectedAlarm', 'custom');
            
            setLastAudioError(null); 
            // Unlock audio context on upload interaction
            unlockAudioContext(); 
        } else if (file) {
            alert("Please select a valid audio file (.mp3, .wav, etc.).");
            event.target.value = null; 
        }
    };

    const clearUploadedSound = () => {
        if (uploadedSoundUrl) {
            URL.revokeObjectURL(uploadedSoundUrl);
        }
        localStorage.removeItem('customAlarmUrl');
        localStorage.removeItem('customAlarmName');
        setUploadedSoundUrl(null);
        setUploadedFileName(null);
        // Revert to 'none'
        if (selectedSound === 'custom') {
            setSelectedSound(SOUND_OPTIONS[0].value);
            localStorage.setItem('selectedAlarm', SOUND_OPTIONS[0].value);
        }
        setLastAudioError(null); 
    };

    const handleSoundChange = (e) => {
        const newSoundValue = e.target.value;
        
        if (newSoundValue === 'custom') {
            if (uploadedSoundUrl) {
                setSelectedSound('custom');
                localStorage.setItem('selectedAlarm', 'custom');
            } else {
                fileInputRef.current.click(); 
            }
        } else {
            setSelectedSound(newSoundValue);
            localStorage.setItem('selectedAlarm', newSoundValue);
        }
        
        if (isAlarmActive) {
            stopAlarm();
        }
        
        // Attempt sample play if a valid non-none sound is selected
        if (newSoundValue !== 'none') {
             unlockAudioContext();
        }
    }


    const handleDurationChange = (e) => {
        const value = e.target.value;
        let newDurationMinutes = 0;
        
        if (value === '') {
            setCustomDuration('');
            newDurationMinutes = 0;
        } else {
            const numValue = parseInt(value);
            if (!isNaN(numValue) && numValue >= 1) {
                newDurationMinutes = numValue;
                setCustomDuration(numValue);
            } else if (!isNaN(numValue) && numValue < 1) {
                newDurationMinutes = 1;
                setCustomDuration(1);
            }
        }

        const timerIsSetup = activeTimer.name !== null && activeTimer.secondsRemaining >= 0;
        
        // This updates the display time immediately when paused
        if (timerIsSetup && isPaused && newDurationMinutes > 0 && activeTimer.name) {
             const newDurationSeconds = newDurationMinutes * 60;
             setActiveTimer(prev => ({
                 ...prev,
                 secondsRemaining: newDurationSeconds,
                 initialDuration: newDurationSeconds,
             }));
        }
    };
    
    const startCountdown = () => {
        unlockAudioContext(); 
        
        if (activeTimer.name && activeTimer.secondsRemaining > 0) {
            setIsPaused(false);
        } else if (activeTimer.name === null) {
            alert("Please select an activity using 'Try Now' first.");
        }
    }
    
    const pauseCountdown = () => {
        setIsPaused(true);
        setBreathingPhase(null); 
    }
    
    const setupTimer = (tip) => { 
        if (activeTimer.name) { 
            alert(`Please finish or stop the current activity (${tip.title}) first.`);
            return;
        }

        let durationInSeconds = tip.duration;
        let durationMinutes = Math.round(tip.duration / 60); 

        if (tip.id !== 4 && typeof customDuration === 'number' && customDuration > 0) {
            durationMinutes = customDuration;
            durationInSeconds = customDuration * 60; 
        } 
        
        if (durationInSeconds <= 0 || !durationInSeconds) {
             alert(`Please set a valid duration (1 minute or more) for ${tip.title}.`);
             return;
        }
        
        setActiveTimer({
            name: tip.title,
            secondsRemaining: durationInSeconds,
            initialDuration: durationInSeconds,
        });
        
        // Synchronize the input field with the activity's default time
        setCustomDuration(durationMinutes); 

        setIsPaused(true); 
        setBreathingPhase(null);
    };
    
    // 🎯 FIX: This handler displays the default time and then allows editing 🎯
    const handleTipClick = (tip) => {
        if (tip.duration && tip.duration > 0) {
            
            // Set input field's initial value based on the tip's default duration
            if (tip.id !== 4) {
                const defaultMinutes = Math.round(tip.duration / 60);
                setCustomDuration(defaultMinutes); 
            }
            
            setupTimer(tip); 
        } else {
            alert(`Starting the "${tip.title}" session!`);
        }
    };

    const submitJournal = () => {
        if (journalEntry.trim()) {
            console.log(`Journal entry saved! Mood: ${mood}/5`);
            alert(`Journal entry saved! Mood: ${mood}/5`);
            setJournalEntry('');
        }
    };

    const handleManageGoals = () => {
        console.log("Navigating to Goals Page or opening modal.");
    };
    
    // --- TIMER EFFECT (unchanged logic) ---
    useEffect(() => {
        if (!activeTimer.name || activeTimer.secondsRemaining <= 0 || isPaused) { 
            return;
        }

        const interval = setInterval(() => {
            setActiveTimer(prev => {
                if (prev.secondsRemaining <= 1) {
                    clearInterval(interval);
                    playAlarmSound(); 
                    return { ...prev, secondsRemaining: 0 }; 
                }
                
                // ANIMATION LOGIC: Box Breathing (ID 2)
                if (prev.name.includes("Box Breathing")) {
                    const elapsedTime = prev.initialDuration - (prev.secondsRemaining - 1);
                    const phaseTime = elapsedTime % 16; 
                    
                    if (phaseTime < 4) {
                        setBreathingPhase('Inhale');
                    } else if (phaseTime < 8) {
                        setBreathingPhase('Hold');
                    } else if (phaseTime < 12) {
                        setBreathingPhase('Exhale');
                    } else {
                        setBreathingPhase('Hold'); 
                    }
                }
                
                return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, [activeTimer.secondsRemaining, activeTimer.name, isPaused, playAlarmSound]); 

    // --- DERIVED STATE ---
    const timerIsSetup = activeTimer.name !== null && activeTimer.secondsRemaining >= 0;
    const timerIsRunning = timerIsSetup && !isPaused;
    const alarmFinishedButActive = activeTimer.name && activeTimer.secondsRemaining === 0 && isAlarmActive;

    // --- VISUALIZATION CHECKS ---
    const isPowerNapActive = activeTimer.name && activeTimer.name.includes("Power Nap"); 
    const isBoxBreathingActive = activeTimer.name && activeTimer.name.includes("Box Breathing");
    const isDigitalSunsetActive = activeTimer.name && activeTimer.name.includes("Digital Sunset");
    const isHydrationActive = activeTimer.name && activeTimer.name.includes("Hydration Check-in");

    // --- Styles for Box Breathing Animation (unchanged) ---
    const breathingStyle = isBoxBreathingActive
        ? {
            ...styles.breathingCircle,
            ...(breathingPhase === 'Inhale' && styles.inhaleStyle),
            ...(breathingPhase === 'Hold' && styles.holdStyle),
            ...(breathingPhase === 'Exhale' && styles.exhaleStyle),
        }
        : styles.breathingCircle;
        
    // --- Styles for Hydration Fill (unchanged) ---
    const hydrationFillPercentage = isHydrationActive 
        ? ((activeTimer.initialDuration - activeTimer.secondsRemaining) / activeTimer.initialDuration) * 100
        : 0;

    // --- Dynamic Options Setup ---
    const customOptionLabel = 'Uploaded: ' + (localStorage.getItem('customAlarmName') || 'Song');
        
    const currentSoundOptions = [
        ...SOUND_OPTIONS.filter(o => o.value !== 'custom'), // Include fixed chimes/none
        ...(localStorage.getItem('customAlarmUrl') ? [{ value: 'custom', label: customOptionLabel }] : []) // Add custom if stored
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            
            <div style={styles.contentArea}>
                
                <audio ref={audioRef} volume="0.5" muted={false} loop={true} /> 
                
                {/* HIDDEN FILE INPUT - Triggered by custom upload button */}
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                />

                {/* Header */}
                <h1 style={styles.pageHeader}>Daily Wellness Hub 🌿</h1>
                <p style={styles.pageSubtitle}>Review your progress, journal, and start a new habit.</p>

                
                {/* 🚨 INLINE ERROR MESSAGE 🚨 */}
                {lastAudioError && (
                    <div style={styles.errorMessageBox}>
                        <p style={{margin: '0', fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                            <FaBan style={{marginRight: '8px', color: '#C0392B'}} />
                            **AUDIO ERROR:** {lastAudioError}
                            {(lastAudioError.includes('Playback failed.')) && (
                                <span style={{marginLeft: '10px'}}> **ACTION: Check browser console. File integrity or permissions issue.**</span>
                            )}
                        </p>
                    </div>
                )}
                
                {/* --- Control Row (Sound Selector and Time Input) --- */}
                <div style={styles.controlRow}>
                    
                    {/* Sound Selector UI */}
                    <div style={styles.soundSelectorWrapper}>
                        <FaMusic style={styles.soundIcon} />
                        <label htmlFor="sound-select" style={styles.soundLabel}>Completion Sound:</label>
                        <select 
                            id="sound-select" 
                            value={selectedSound} 
                            onChange={handleSoundChange}
                            style={styles.soundSelect}
                        >
                            {currentSoundOptions.map(option => (
                                <option 
                                    key={option.value} 
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        
                        {/* UPLOAD/CLEAR BUTTON */}
                        {!localStorage.getItem('customAlarmUrl') ? (
                            <button 
                                onClick={() => document.querySelector('input[type="file"]').click()} 
                                style={{...styles.soundTestButton, backgroundColor: '#2ECC71', marginLeft: '10px'}}
                                title="Upload Custom Sound"
                            >
                                <FaUpload />
                            </button>
                        ) : (
                            // Display clear button if a sound is uploaded
                            <button 
                                onClick={clearUploadedSound} 
                                style={{...styles.soundTestButton, backgroundColor: '#C0392B', marginLeft: '10px'}}
                                title="Clear Custom Uploaded Sound"
                            >
                                <FaTimesCircle />
                            </button>
                        )}
                    </div>

                    {/* TIME INPUT FIELD */}
                    <div style={styles.timeInputWrapper}>
                        <FaClock style={styles.timeIcon} />
                        <label htmlFor="duration-input" style={styles.timeLabel}>Activity Time (min):</label>
                        <input
                            id="duration-input"
                            type="number"
                            min="1"
                            value={isDigitalSunsetActive ? 60 : customDuration} 
                            onChange={handleDurationChange}
                            style={styles.timeInput} 
                            placeholder="Min"
                            disabled={timerIsRunning || alarmFinishedButActive || isDigitalSunsetActive}
                        />
                    </div>
                </div>
                {/* --- End Control Row --- */}

                {/* 💡 TIMER/ALARM DISPLAY SECTION */}
                {(timerIsSetup || alarmFinishedButActive) && (
                    <div style={{
                        ...styles.timerBox, 
                        minHeight: (isBoxBreathingActive || isDigitalSunsetActive || isHydrationActive || isPowerNapActive) ? '180px' : '60px',
                        backgroundColor: alarmFinishedButActive ? '#E74C3C' : (isDigitalSunsetActive ? styles.digitalSunsetColor : isHydrationActive ? styles.hydrationCheckinColor : isPowerNapActive ? styles.powerNapColor : '#3498DB'),
                        flexDirection: (isBoxBreathingActive || isDigitalSunsetActive || isHydrationActive || isPowerNapActive) ? 'column' : 'row',
                        justifyContent: (isBoxBreathingActive || isDigitalSunsetActive || isHydrationActive || isPowerNapActive) ? 'space-around' : 'space-between',
                        alignItems: (isBoxBreathingActive || isDigitalSunsetActive || isHydrationActive || isPowerNapActive) ? 'center' : 'center',
                    }}>
                        
                        {/* 👈 VISUALIZATIONS */}
                        {isBoxBreathingActive && (
                            <div style={styles.animationContainer}>
                                <div style={breathingStyle}>
                                    {breathingPhase}
                                </div>
                            </div>
                        )}
                        {isDigitalSunsetActive && (
                            <div style={styles.animationContainer}>
                                <FaBan style={styles.noPhoneIcon} />
                                <span style={styles.noPhoneText}>NO SCREENS</span>
                            </div>
                        )}
                        {isHydrationActive && (
                            <div style={styles.animationContainer}>
                                <div style={styles.hydrationVisual}>
                                    <div style={{...styles.hydrationFill, height: `${hydrationFillPercentage}%`, }}/>
                                    <FaTint style={styles.waterDropIcon} />
                                </div>
                                <span style={styles.hydrationText}>
                                    {hydrationFillPercentage < 100 ? "Keep your bottle visible!" : "Time to Drink!"}
                                </span>
                            </div>
                        )}
                        {isPowerNapActive && (
                            <div style={styles.animationContainer}>
                                <FaBed style={styles.sleepingBedIcon} /> 
                                <span style={styles.napText}>RECHARGING...</span>
                            </div>
                        )}

                        
                        <div style={styles.timerControls}>
                            <p style={styles.timerText}>
                                {alarmFinishedButActive ? 'ALARM ACTIVE:' : 'Active Session:'} 
                                <span style={{fontWeight: 'bold'}}>{activeTimer.name}</span>
                            </p>
                            
                            <h2 style={styles.timerDisplay}>
                                {alarmFinishedButActive ? '00:00' : formatTime(activeTimer.secondsRemaining)}
                            </h2>

                            {alarmFinishedButActive ? (
                                <button onClick={stopAlarm} style={styles.stopAlarmButton}>
                                    <FaStop style={{marginRight: '6px'}} /> Stop Alarm
                                </button>
                            ) : (
                                <div>
                                    {timerIsRunning ? (
                                        // PAUSE BUTTON
                                        <button onClick={pauseCountdown} style={styles.pauseButton}>
                                            <FaPause style={{marginRight: '6px'}} /> Pause
                                        </button>
                                    ) : (
                                        // START/RESUME BUTTON
                                        <button onClick={startCountdown} style={styles.startButton}>
                                            <FaPlay style={{marginRight: '6px'}} /> {activeTimer.secondsRemaining === activeTimer.initialDuration ? 'Start' : 'Resume'}
                                        </button>
                                    )}
                                    {/* END BUTTON */}
                                    <button 
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to end this session early?")) {
                                                stopAlarm(); 
                                            }
                                        }}
                                        style={styles.cancelButton}
                                    >
                                        End
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* 🎯 RESTORED DASHBOARD GRID STRUCTURE 🎯 */}
                <div style={styles.dashboardGrid}>
                    
                    {/* TOP ROW: GOAL PROGRESS & CURRENT MOOD (Cards) */}
                    <div style={styles.statusRow}>
                        
                        {/* Daily Goal Progress Card */}
                        <div style={styles.statusCard}>
                            <h3 style={styles.statusCardHeader}>Daily Goal Progress</h3>
                            <p style={styles.statusCardText}>You've completed 2/4 goals.</p>
                            <div style={styles.progressBarContainer}>
                                <div style={{...styles.progressBar, width: '50%'}}></div>
                            </div>
                            <button onClick={handleManageGoals} style={styles.manageGoalsButton}> 
                                <FaRunning style={{marginRight: '6px'}} /> Manage Goals
                            </button>
                        </div>
                        
                        {/* Current Mood Card */}
                        <div style={styles.statusCard}>
                            <h3 style={styles.statusCardHeader}>Current Mood: {mood}/5</h3>
                            <p style={styles.statusCardText}>How are you feeling right now?</p>
                            <div style={styles.moodSelector}>
                                {/* Render Mood Icons here */}
                                <span style={styles.moodIcon}>😔</span>
                                <span style={styles.moodIcon}>😟</span>
                                <span style={{...styles.moodIcon, opacity: 1, transform: 'scale(1.2)'}}>😐</span>
                                <span style={styles.moodIcon}>🙂</span>
                                <span style={styles.moodIcon}>😊</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* MAIN JOURNAL AREA (Full Width Card) */}
                    <div style={styles.journalCard}>
                        <h2 style={styles.cardHeader}>Mindful Journal</h2>
                        <p style={styles.journalText}>What's on your mind? Capture three good things that happened today...</p>
                        <textarea
                            value={journalEntry}
                            onChange={(e) => setJournalEntry(e.target.value)}
                            style={styles.journalInput}
                            rows="4" 
                        />
                        <button onClick={submitJournal} style={styles.journalButton}>
                            Save Entry
                        </button>
                    </div>
                </div>
                {/* END Dashboard Grid */}


                {/* 3. FEATURED TIPS SECTION */}
                <h2 style={styles.sectionHeader}>Featured Wellness Tips</h2>
                <div style={styles.tipsGrid}>
                    {activeTips.map((tip, index) => (
                        <TipCard key={index} tip={tip} onClick={handleTipClick} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- STYLES OBJECT (Final Styles with Restored Dashboard Layout) ---
const styles = {
    // LAYOUT CONTAINERS
    contentArea: { 
        flexGrow: 1, 
        padding: '40px 30px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        backgroundColor: '#f0f0f5', 
    },
    dashboardGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginBottom: '40px',
    },
    statusRow: {
        display: 'flex',
        gap: '20px',
        width: '100%',
    },
    
    // --- TOP STATUS CARDS ---
    statusCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
    },
    statusCardHeader: {
        fontSize: '18px',
        color: '#6A1B9A',
        marginBottom: '10px',
        fontWeight: 'bold',
    },
    statusCardText: {
        fontSize: '14px',
        color: '#7F8C8D',
        marginBottom: '15px',
    },
    progressBarContainer: {
        backgroundColor: '#ECF0F1',
        borderRadius: '5px',
        height: '10px', 
        width: '100%',
        marginBottom: '15px',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50', 
        borderRadius: '5px',
        width: '50%', // Mock progress
    },
    manageGoalsButton: {
        backgroundColor: '#3498DB',
        color: 'white',
        border: 'none',
        padding: '6px 12px', 
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
    },
    moodSelector: { display: 'flex', gap: '10px', justifyContent: 'space-around' },
    moodIcon: { fontSize: '24px', opacity: 0.4, transition: 'all 0.2s' },

    // --- JOURNAL CARD ---
    journalCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
    },
    cardHeader: {
        fontSize: '22px', 
        color: '#6A1B9A', 
        borderBottom: '1px solid #EEE', 
        paddingBottom: '10px', 
        marginBottom: '15px'
    },
    journalText: { fontSize: '14px', color: '#555', marginBottom: '15px' },
    journalInput: {
        width: '100%',
        minHeight: '100px',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        resize: 'vertical',
        marginBottom: '10px',
    },
    journalButton: {
        backgroundColor: '#9B59B6',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
        float: 'right',
        fontWeight: 'bold',
    },

    // --- FEATURED TIPS GRID ---
    sectionHeader: { fontSize: '24px', color: '#34495E', marginBottom: '15px', marginTop: '10px' },
    tipsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px',
        paddingTop: '10px',
    },
    tipCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        padding: '15px',
        borderLeft: '4px solid', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '200px',
    },
    tipIconWrapper: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#6A1B9A',
        margin: '0 0 8px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
    },
    tipTitle: { fontSize: '16px', margin: '0 0 5px 0' },
    tipCategory: { fontSize: '10px', color: '#7F8C8D', textTransform: 'uppercase' },
    tipDetail: { fontSize: '13px', color: '#555', marginTop: '10px', flexGrow: 1 },
    actionButton: {
        marginTop: '15px',
        padding: '8px 15px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '13px',
        width: '100%',
    },

    // --- TIMER/ALARM STYLES ---
    soundDisplay: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '20px',
    },
    soundIcon: { color: '#6A1B9A', marginRight: '8px', fontSize: '18px' },
    soundLabel: { fontSize: '14px', color: '#34495E', marginRight: '5px', fontWeight: '500' },
    soundName: { fontSize: '14px', color: '#6A1B9A', fontWeight: 'bold' },
    errorMessageBox: {
        backgroundColor: '#FBEFEF', 
        border: '1px solid #C0392B', 
        color: '#C0392B',
        padding: '10px 15px',
        borderRadius: '6px',
        marginBottom: '15px',
        fontSize: '14px',
    },
    controlRow: { display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '20px', marginBottom: '30px', paddingBottom: '10px', borderBottom: '1px solid #EEE' },
    timeInputWrapper: { display: 'flex', alignItems: 'center' },
    timeIcon: { color: '#6A1B9A', marginRight: '8px', fontSize: '18px' },
    timeLabel: { fontSize: '14px', color: '#34495E', marginRight: '10px', fontWeight: '500' },
    timeInput: { width: '80px', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', textAlign: 'center' },
    timerBox: {
        backgroundColor: '#3498DB', 
        color: 'white',
        padding: '15px 20px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        marginBottom: '20px',
    },
    timerControls: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 0',
    },
    timerText: { fontSize: '14px', margin: 0 },
    timerDisplay: { fontSize: '32px', fontWeight: 'bold' },
    startButton: {
        backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', marginRight: '10px',
    },
    pauseButton: {
        backgroundColor: '#F39C12', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', marginRight: '10px',
    },
    stopAlarmButton: {
        backgroundColor: '#C0392B', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#2980B9', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center',
    },
    // VISUAL ANIMATION STYLES (for Box Breathing, Nap, Hydration, Sunset)
    animationContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '10px',
    },
    breathingCircle: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#3498DB',
        transition: 'transform 4s ease-in-out', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        opacity: 0.8,
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
    },
    inhaleStyle: { transform: 'scale(1.5)', backgroundColor: '#2ECC71', },
    holdStyle: { transform: 'scale(1.5)', backgroundColor: '#F39C12', },
    exhaleStyle: { transform: 'scale(1)', backgroundColor: '#9B59B6', },
    powerNapColor: '#2980B9', 
    sleepingBedIcon: { fontSize: '70px', color: 'white', animation: 'pulse 2s ease-in-out infinite alternate', },
    napText: { fontSize: '18px', fontWeight: 'bold', color: 'white', marginTop: '10px', },
    hydrationCheckinColor: '#2ECC71', 
    hydrationVisual: { width: '60px', height: '100px', border: '3px solid white', borderRadius: '5px 5px 30px 30px', position: 'relative', overflow: 'hidden', marginBottom: '5px', },
    hydrationFill: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#98D0FF', transition: 'height 1s linear', },
    waterDropIcon: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '30px', color: 'white', zIndex: 10, textShadow: '0 0 5px rgba(0,0,0,0.5)', },
    hydrationText: { fontSize: '16px', fontWeight: 'bold', color: 'white', },
    digitalSunsetColor: '#F39C12', 
    noPhoneIcon: { fontSize: '70px', color: 'white', animation: 'pulse 1.5s infinite alternate', marginBottom: '5px', },
    noPhoneText: { fontSize: '18px', fontWeight: 'bold', color: 'white', },
};

export default WellnessPage;