// js/events.js
import { difficultyButtons, returnToTitleButton, debugCheckbox, canvas, titleScreen, gameScreen, modal } from './ui.js';
import { initializeGame, handleCanvasClick, setGameState, setShowEnemies } from './game.js';
import { initAudio } from './audio.js';

export function setupEventListeners() {
    difficultyButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            await initAudio();
            const difficulty = e.target.dataset.difficulty;
            titleScreen.style.display = 'none';
            gameScreen.style.display = 'flex';
            modal.style.display = 'none';
            setGameState('playing');
            initializeGame(difficulty, canvas);
        });
    });

    returnToTitleButton.addEventListener('click', () => {
        modal.style.display = 'none';
        gameScreen.style.display = 'none';
        titleScreen.style.display = 'flex';
        setGameState('title');
    });
    
    debugCheckbox.addEventListener('change', (e) => {
        setShowEnemies(e.target.checked);
    });

    canvas.addEventListener('click', (event) => {
        handleCanvasClick(event, canvas);
    });
}
