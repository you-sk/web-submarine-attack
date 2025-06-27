// js/game.js
import { updateUI, showModal } from './ui.js';
import { playSinkingSound } from './audio.js';

export const NUMBER_OF_TARGETS = 8;
export const RIPPLE_MAX_RADIUS = 75;
export const difficultySettings = {
    easy:   { initialBombs: 20, reward: 3 },
    normal: { initialBombs: 20, reward: 2 },
    hard:   { initialBombs: 15, reward: 1 }
};

export let ripples = [], targets = [], explosions = [];
export let remainingSubmarines, bombsLeft, bombsDropped, currentBombReward;
export let gameState = 'title';
export let showEnemies = false; // デバッグ用

export function initializeGame(difficulty, canvas) {
    ripples = []; targets = []; explosions = [];
    
    const settings = difficultySettings[difficulty];
    remainingSubmarines = NUMBER_OF_TARGETS;
    bombsLeft = settings.initialBombs;
    currentBombReward = settings.reward;
    bombsDropped = 0;

    for (let i = 0; i < NUMBER_OF_TARGETS; i++) {
        targets.push({ x: Math.random() * (canvas.width - 40) + 20, y: Math.random() * (canvas.height - 40) + 20, sunk: false });
    }
    updateUI(remainingSubmarines, bombsLeft);
}

export function handleCanvasClick(event, canvas) {
    if (gameState !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    bombsLeft--; bombsDropped++;
    
    for (const target of targets) {
        if (!target.sunk) {
            const hitBox = 5;
            if (clickX >= target.x - hitBox && clickX <= target.x + hitBox && clickY >= target.y - hitBox && clickY <= target.y + hitBox) {
                target.sunk = true; remainingSubmarines--; bombsLeft += currentBombReward;
                explosions.push({ x: target.x, y: target.y, radius: 5, alpha: 1 });
                playSinkingSound();
                break;
            }
        }
    }

    ripples.push({ x: clickX, y: clickY, radius: 0, maxRadius: RIPPLE_MAX_RADIUS, alpha: 1, hitTarget: false, stopped: false });
    updateUI(remainingSubmarines, bombsLeft);

    if (remainingSubmarines === 0) {
        gameState = 'cleared';
        setTimeout(() => showModal('ゲームクリア！', `投下した爆弾の数: ${bombsDropped}個`, 'text-blue-600'), 500);
    } else if (bombsLeft <= 0) {
        bombsLeft = 0; updateUI(remainingSubmarines, bombsLeft);
        gameState = 'gameOver';
        setTimeout(() => showModal('ゲームオーバー', '爆弾を使い果たしました。'), 500);
    }
}

export function setGameState(newState) {
    gameState = newState;
}

export function setShowEnemies(value) {
    showEnemies = value;
}
