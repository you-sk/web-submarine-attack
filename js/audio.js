// js/audio.js
let isAudioReady = false;

export async function initAudio() {
    if (!isAudioReady) {
        await Tone.start();
        isAudioReady = true;
    }
}

/** 撃沈サウンドを再生する関数 */
export function playSinkingSound() {
    if (!isAudioReady) return;
    const explosion = new Tone.MembraneSynth().toDestination();
    const bubbles = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.8 }}).toDestination();
    const now = Tone.now();
    explosion.triggerAttackRelease("C2", "8n", now);
    bubbles.triggerAttackRelease("2n", now + 0.1);
}
