// DOM要素の取得
        const titleScreen = document.getElementById('titleScreen');
        const gameScreen = document.getElementById('gameScreen');
        const difficultyButtons = document.querySelectorAll('.difficulty-buttons button');
        const canvas = document.getElementById('seaCanvas');
        const ctx = canvas.getContext('2d');
        const remainingSubmarinesSpan = document.getElementById('remainingSubmarines');
        const bombsLeftSpan = document.getElementById('bombsLeft');
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const returnToTitleButton = document.getElementById('returnToTitleButton');
        const debugCheckbox = document.getElementById('debugCheckbox');

        // --- ゲーム設定 ---
        const NUMBER_OF_TARGETS = 8;
        const RIPPLE_MAX_RADIUS = 75;
        const difficultySettings = {
            easy:   { initialBombs: 20, reward: 3 },
            normal: { initialBombs: 20, reward: 2 },
            hard:   { initialBombs: 15, reward: 1 }
        };
        // ------------------

        // ゲーム状態の変数
        let ripples = [], targets = [], explosions = [];
        let remainingSubmarines, bombsLeft, bombsDropped, currentBombReward;
        let gameState = 'title';
        let isAudioReady = false;
        let showEnemies = false; // デバッグ用
        let waveTime = 0; // 海の波アニメーション用

        /** 撃沈サウンドを再生する関数 */
        function playSinkingSound() {
            if (!isAudioReady) return;
            const explosion = new Tone.MembraneSynth().toDestination();
            const bubbles = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.8 }}).toDestination();
            const now = Tone.now();
            explosion.triggerAttackRelease("C2", "8n", now);
            bubbles.triggerAttackRelease("2n", now + 0.1);
        }

        /** ゲームを初期化またはリセットする関数 */
        function initializeGame(difficulty) {
            ripples = []; targets = []; explosions = [];
            
            const settings = difficultySettings[difficulty];
            remainingSubmarines = NUMBER_OF_TARGETS;
            bombsLeft = settings.initialBombs;
            currentBombReward = settings.reward;
            bombsDropped = 0;

            for (let i = 0; i < NUMBER_OF_TARGETS; i++) {
                targets.push({ x: Math.random() * (canvas.width - 40) + 20, y: Math.random() * (canvas.height - 40) + 20, sunk: false });
            }
            updateUI();
        }
        
        function updateUI() {
            remainingSubmarinesSpan.textContent = remainingSubmarines;
            bombsLeftSpan.textContent = bombsLeft;
        }

        function showModal(title, message, color = 'text-red-600') {
            modalTitle.textContent = title;
            modalTitle.className = `modal-title ${color}`;
            modalMessage.textContent = message;
            modal.style.display = 'flex';
        }
        
        function drawSeaBackground() {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            const waveAmplitude = 3, waveFrequency = 0.03;
            for (let i = 0; i < 20; i++) {
                const yOffset = (canvas.height / 20) * i;
                ctx.beginPath();
                ctx.moveTo(0, yOffset);
                for (let x = 0; x < canvas.width; x++) {
                    const y = yOffset + Math.sin(x * waveFrequency + waveTime + i * 0.5) * waveAmplitude;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            ctx.restore();
        }

        function drawSunkMarks() {
            ctx.strokeStyle = '#374151'; ctx.fillStyle = 'white'; ctx.lineWidth = 2;
            targets.forEach(target => {
                if (target.sunk) {
                    const poleHeight = 20, flagWidth = 12, flagHeight = 8, x = target.x, y = target.y;
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - poleHeight); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(x, y - poleHeight); ctx.lineTo(x + flagWidth, y - poleHeight + flagHeight / 2); ctx.lineTo(x, y - poleHeight + flagHeight); ctx.closePath(); ctx.fill(); ctx.stroke();
                }
            });
        }

        function drawTargets() {
            if (!showEnemies) return;
            ctx.strokeStyle = 'red'; ctx.lineWidth = 3;
            targets.forEach(target => {
                if (!target.sunk) {
                    const size = 10;
                    ctx.beginPath(); ctx.moveTo(target.x - size, target.y - size); ctx.lineTo(target.x + size, target.y + size); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(target.x + size, target.y - size); ctx.lineTo(target.x - size, target.y + size); ctx.stroke();
                }
            });
        }
        
        function drawExplosions() {
            for (let i = explosions.length - 1; i >= 0; i--) {
                const exp = explosions[i];
                ctx.fillStyle = `rgba(255, 165, 0, ${exp.alpha})`;
                ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2); ctx.fill();
                exp.radius += 0.5; exp.alpha -= 0.02;
                if (exp.alpha <= 0) explosions.splice(i, 1);
            }
        }

        // --- イベントハンドラ ---
        difficultyButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                if (!isAudioReady) {
                    await Tone.start(); isAudioReady = true;
                }
                const difficulty = e.target.dataset.difficulty;
                titleScreen.style.display = 'none';
                gameScreen.style.display = 'flex';
                modal.style.display = 'none';
                gameState = 'playing';
                initializeGame(difficulty);
            });
        });

        returnToTitleButton.addEventListener('click', () => {
            modal.style.display = 'none'; gameScreen.style.display = 'none';
            titleScreen.style.display = 'flex'; gameState = 'title';
        });
        
        debugCheckbox.addEventListener('change', (e) => {
            showEnemies = e.target.checked;
        });

        canvas.addEventListener('click', (event) => {
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
            updateUI();

            if (remainingSubmarines === 0) {
                gameState = 'cleared';
                setTimeout(() => showModal('ゲームクリア！', `投下した爆弾の数: ${bombsDropped}個`, 'text-blue-600'), 500);
            } else if (bombsLeft <= 0) {
                bombsLeft = 0; updateUI();
                gameState = 'gameOver';
                setTimeout(() => showModal('ゲームオーバー', '爆弾を使い果たしました。'), 500);
            }
        });

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (gameState !== 'title') {
                drawSeaBackground();
                for (let i = ripples.length - 1; i >= 0; i--) {
                    const r = ripples[i];
                    if (!r.stopped && r.radius < r.maxRadius) r.radius += 0.8;
                    if (!r.hitTarget && !r.stopped) {
                        for (const target of targets) {
                            if (!target.sunk && Math.hypot(r.x - target.x, r.y - target.y) <= r.radius) {
                                r.hitTarget = true; r.stopped = true; break;
                            }
                        }
                    }
                    if (!r.hitTarget && r.radius >= r.maxRadius) r.stopped = true;
                    ctx.beginPath();
                    if (r.hitTarget) ctx.strokeStyle = `rgba(0, 0, 139, 0.8)`;
                    else if (r.stopped) ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
                    else ctx.strokeStyle = `rgba(255, 255, 255, 1)`;
                    ctx.lineWidth = 2; ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2); ctx.stroke();
                }
                drawSunkMarks(); drawExplosions(); drawTargets();
            }
            waveTime += 0.03;
        }
        animate();