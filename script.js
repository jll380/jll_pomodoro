const MODES = {
	pomodoro: 25 * 60,
	shortBreak: 5 * 60, 
	longBreak: 10 * 60,
	custom: null
};

// Global State
let currentMode = 'pomodoro';
let initialDuration = MODES[currentMode];
let remainingSeconds = initialDuration;
// let timerInterval = null;
let isRunning = false;

// Switching to using timestamps for timer
let startTime = null;
let duration = initialDuration;
let timerInterval = null;
let pausedTime = 0;
let currentModeSeconds = initialDuration;

// Format mm:ss display for consistency
function formatTime(seconds) {
	const m = Math.floor(seconds / 60).toString().padStart(2, '0');
	const s = (seconds % 60).toString().padStart(2, '0');
	return `${m}:${s}`;
}


// Centralize remaining time display
const displayEl = document.getElementById('timer-display');

// function updateDisplay() {
// 	displayEl.textContent = formatTime(remainingSeconds);
// }

function updateDisplay(seconds) {
	const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
	const secs = (seconds % 60).toString().padStart(2, '0');
	// document.getElementById('timer-display').textContent = `${mins}:${secs}`;
	displayEl.textContent = `${mins}:${secs}`;
}

// UI toggle helper
const modeButtonsEl = document.getElementById('mode-buttons');
const controlButtonsEl = document.getElementById('control-buttons');
const playPauseBtn = document.getElementById('play-pause');

function toggleToControls() {
	modeButtonsEl.style.display = 'none';
	controlButtonsEl.style.display = 'flex';
	playPauseBtn.textContent = 'pause'
}

function toggleToModes() {
	modeButtonsEl.style.display = 'flex';
	controlButtonsEl.style.display = 'none';
	playPauseBtn.textContent = 'play'
}

// Set mode
function setMode(modeName, customSeconds = null) {
	currentMode = modeName;

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

// Timer control
// function startTimer() {
// 	if (isRunning) return;
// 	if (remainingSeconds <= 0) remainingSeconds = initialDuration;

// 	isRunning = true;

// 	timerInterval = setInterval(() => {
// 			remainingSeconds--;
// 			updateDisplay();
// 			if (remainingSeconds <= 0) {
// 				clearInterval(timerInterval);
// 				isRunning = false;
// 				let beeps;
// 				if (currentMode == 'pomodoro' || currentMode == 'custom') {
// 					beeps = 5;
// 					freq = 880;
// 				}
// 				if (currentMode == 'shortBreak' || currentMode == 'longBreak') {
// 					beeps = 3;
// 					freq = 440;
// 				}
// 				playAlarm(beeps, freq);
// 				toggleToModes;
// 			}
// 		}, 1000);
// 		toggleToControls();
// }

function startTimer(seconds) {
	clearInterval(timerInterval);
	duration = seconds;
	startTime = Date.now();
	pausedTime = 0;
	isRunning = true;
	toggleToControls();
	updateDisplay(duration)

	// if (timerInterval) clearInterval(timerInterval);
	// timerInterval = setInterval(updateTimer, 200); // 200ms for smooth updates
	// toggleToControls();

	timerInterval = setInterval(() => {
		const elapsed = Math.floor((Date.now() - startTime) / 1000);
		const remaining = duration - elapsed;
		updateDisplay(Math.max(remaining, 0));

		if (remaining <= 0) {
			clearInterval(timerInterval);
			isRunning = false;
			playModeAlarm();
			toggleToModes();
		}
	}, 1000)
}


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
		// switch to next mode here?
	}

}


// function pauseTimer() {
// 	if (!isRunning) return;
// 	clearInterval(timerInterval);
// 	isRunning = false;
// 	playPauseBtn.textContent = 'play';
// }

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
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = duration - elapsed;
        updateDisplay(Math.max(remaining, 0));
        if (remaining <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            playModeAlarm();
            toggleToModes();
        }
    }, 1000);
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