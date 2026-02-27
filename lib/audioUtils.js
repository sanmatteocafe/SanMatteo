/**
 * playChime - A high-fidelity synthesized audio notification using Web Audio API.
 * This provides a luxury "ding" sound without requiring external audio files.
 */
export const playChime = () => {
    if (typeof window === 'undefined') return;

    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();

        /**
         * playSingleTing - Pure high-pitched synthesized chime
         */
        const playSingleTing = (time) => {
            const osc = context.createOscillator();
            const gain = context.createGain();

            // High-pitched crystal "Ting" frequency
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1760, time); // A6
            osc.frequency.exponentialRampToValueAtTime(880, time + 0.1);

            // Shorter, sharper envelope for "Ting" feel
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.15, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

            osc.connect(gain);
            gain.connect(context.destination);

            osc.start(time);
            osc.stop(time + 0.4);
        };

        // Double chime: Ting Ting
        playSingleTing(context.currentTime);
        playSingleTing(context.currentTime + 0.15); // Second ting shortly after

    } catch (e) {
        console.warn("Audio chime failed:", e);
    }
};
