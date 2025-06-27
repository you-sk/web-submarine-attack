// js/ui.js
export const titleScreen = document.getElementById('titleScreen');
export const gameScreen = document.getElementById('gameScreen');
export const difficultyButtons = document.querySelectorAll('.difficulty-buttons button');
export const canvas = document.getElementById('seaCanvas');
export const ctx = canvas.getContext('2d');
export const remainingSubmarinesSpan = document.getElementById('remainingSubmarines');
export const bombsLeftSpan = document.getElementById('bombsLeft');
export const modal = document.getElementById('modal');
export const modalTitle = document.getElementById('modalTitle');
export const modalMessage = document.getElementById('modalMessage');
export const returnToTitleButton = document.getElementById('returnToTitleButton');
export const debugCheckbox = document.getElementById('debugCheckbox');

export function updateUI(remainingSubmarines, bombsLeft) {
    remainingSubmarinesSpan.textContent = remainingSubmarines;
    bombsLeftSpan.textContent = bombsLeft;
}

export function showModal(title, message, color = 'text-red-600') {
    modalTitle.textContent = title;
    modalTitle.className = `modal-title ${color}`;
    modalMessage.textContent = message;
    modal.style.display = 'flex';
}
