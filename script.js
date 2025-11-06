const MODES = {
	pomodoro: 25 * 60,
	shortBreak: 5 * 60, 
	longBreak: 10 * 60,
	custom: null
};

// Global State
let currentMode = 'pomodoro'; // sets Pomodoro as default mode
let initialDuration = MODES[currentMode]; // sets initial duration
let remainingSeconds = initialDuration; // remaining seconds will be initial duration at start
let isRunning = false; // no timer running, so function is false
let startTime = null; // no timer started, so start time not yet captured
let duration = initialDuration; 
let timerInterval = null;
let pausedTime = 0;
let currentModeSeconds = initialDuration;

// UI toggle helper
const modeButtonsEl = document.getElementById('mode-buttons'); // Mode buttons element
const controlButtonsEl = document.getElementById('control-buttons'); // Control buttons element
const playPauseBtn = document.getElementById('play-pause'); // Play/pause button, which will have multiple uses
const displayEl = document.getElementById('timer-display'); // Timer display element

// Format mm:ss display for consistency
function formatTime(seconds) {
	const m = Math.floor(seconds / 60).toString().padStart(2, '0');
	const s = (seconds % 60).toString().padStart(2, '0');
	return `${m}:${s}`;
}

// Function to update display with time remaining
function updateDisplay(seconds) {
	const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
	const secs = (seconds % 60).toString().padStart(2, '0');
	// document.getElementById('timer-display').textContent = `${mins}:${secs}`;
	displayEl.textContent = `${mins}:${secs}`;
}


// When triggered, switches display to show control buttons (play/pause, stop, reset)
function toggleToControls() {
	modeButtonsEl.style.display = 'none';
	controlButtonsEl.style.display = 'flex';
	playPauseBtn.textContent = 'pause'
}

// When triggered, switches display to show mode buttons (Pomodoro, break, cycle, custom)
function toggleToModes() {
	modeButtonsEl.style.display = 'flex';
	controlButtonsEl.style.display = 'none';
	playPauseBtn.textContent = 'play'
}

// Function to set initial states upon triggering specific modes
function setMode(modeName, customSeconds = null) {
	currentMode = modeName;

	// Custom mode calculation duration calculation, reading customSeconds from user input
	if (modeName == 'custom' && Number.isFinite(customSeconds)) {
		initialDuration = customSeconds
		MODES.custom = customSeconds;
	} else {
		initialDuration = MODES[modeName];
	}
	remainingSeconds = initialDuration;
	currentModeSeconds = initialDuration;
	updateDisplay();
}

// Function to handle timer update behavior
function updateTimer() {
	const now = Date.now();
	const elapsed = Math.floor((now - startTime) / 1000);
	const timeLeft = Math.max(0, duration - elapsed);

	updateDisplay(timeLeft);

	if (timeLeft <= 0) {
		clearInterval(timerInterval)
		let beeps;
		if (currentMode == 'pomodoro' || currentMode == 'custom') {
			beeps = 5;
			freq = 880;
		}
		if (currentMode == 'shortBreak' || currentMode == 'longBreak') {
			beeps = 3;
			freq = 440;
		}
		playModeAlarm();
		toggleToModes();
		// switch to next mode here?
	}

}

// Function to begin timer based on mode inputs
function startTimer(seconds) {
	clearInterval(timerInterval);
	duration = seconds; // seconds input read from currentModeSeconds variable, adjusted in setMode()
	startTime = Date.now();
	pausedTime = 0;
	isRunning = true;
	toggleToControls(); // ensures timer controls are displayed 
	updateDisplay(duration)
	updateTimer();
	timerInterval = setInterval(updateTimer, 1000)
}




function pauseTimer() {
    clearInterval(timerInterval);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    pausedTime = Math.max(0, duration - elapsed);
    isRunning = false;
    playPauseBtn.textContent = 'play';
}

function resumeTimer() {
	clearInterval(timerInterval);
    startTime = Date.now();
    duration = pausedTime;
    isRunning = true;
    updateDisplay(duration);
	updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    playPauseBtn.textContent = 'pause';
}

function resetTimer() {
	clearInterval(timerInterval);
	remainingSeconds = initialDuration;
	updateDisplay(remainingSeconds)
	isRunning = false;
	pausedTime = 0;
	// if timer is paused, it will stay paused
}

function stopTimer() {
	clearInterval(timerInterval);
	isRunning = false;
	currentMode = 'pomodoro'; 
	setMode('pomodoro');
	updateDisplay(remainingSeconds);
	toggleToModes();
}

// Play alarm function - 5 beeps for Pomodoro/custom, 3 beeps for breaks
function playAlarm(beepCount = 1, freq = 880) {
	try {
		const ctx = new (window.AudioContext || window.webkitAudioContext)();

		let i = 0;

		function beep() {
			if (i >= beepCount) return;
			const o = ctx.createOscillator();
			const g = ctx.createGain();
			o.type = 'sine';
			o.frequency.value = freq;
			o.connect(g);
			g.connect(ctx.destination);
			o.start();
			g.gain.setValueAtTime(0.0001, ctx.currentTime);
			g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
			setTimeout(() => {
				g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
				o.stop(ctx.currentTime + 0.21);
				i++;
				setTimeout(beep, 150);
			}, 200);
		}
			beep();

		} catch (e) {
			// fallback if alarm doesn't work
			alert("time's up!");
			}


		}

function playModeAlarm() {
	let beeps, freq;
	if (currentMode === 'pomodoro' || currentMode === 'custom') {
		beeps = 5; freq = 880
	} else {
		beeps = 3; freq = 440;
	}
	playAlarm(beeps, freq)
}

// Event listeners
document.getElementById('pomodoro').addEventListener('click', () => {
	setMode('pomodoro');
	startTimer(currentModeSeconds);
})

document.getElementById('short-break').addEventListener('click', () => {
    setMode('shortBreak');
    startTimer(currentModeSeconds);
});

document.getElementById('long-break').addEventListener('click', () => {
	setMode('longBreak');
	startTimer(currentModeSeconds);
})

document.getElementById('cycle').addEventListener('click', () => {
	alert('under construction');
})

document.getElementById('custom').addEventListener('click', () => {
	const minutes = parseFloat(prompt('enter minutes for custom timer (e.g. 12.5:'));
	if (!isNaN(minutes) && minutes > 0) {
		setMode('custom', Math.round(minutes * 60));
		startTimer(currentModeSeconds);
	}
})

playPauseBtn.addEventListener('click', () => {
	if (!isRunning && pausedTime === 0) {
		startTimer(currentModeSeconds);
		// playPauseBtn.textContent = 'pause';
	} else if (isRunning) {
		pauseTimer();
		// playPauseBtn.textContent = 'play';
	} else {
		resumeTimer();
		// playPauseBtn.textContent = 'pause';
	}
})

document.getElementById('stop').addEventListener('click', () => {
	stopTimer();
})

document.getElementById('reset').addEventListener('click', () => {
	resetTimer();
})