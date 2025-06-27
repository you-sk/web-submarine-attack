// js/rendering.js
import { ctx, canvas } from './ui.js';
import { ripples, targets, explosions, gameState, showEnemies } from './game.js';

let waveTime = 0; // 海の波アニメーション用

export function drawSeaBackground() {
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

export function drawSunkMarks() {
    ctx.strokeStyle = '#374151'; ctx.fillStyle = 'white'; ctx.lineWidth = 2;
    targets.forEach(target => {
        if (target.sunk) {
            const poleHeight = 20, flagWidth = 12, flagHeight = 8, x = target.x, y = target.y;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - poleHeight); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, y - poleHeight); ctx.lineTo(x + flagWidth, y - poleHeight + flagHeight / 2); ctx.lineTo(x, y - poleHeight + flagHeight); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
    });
}

export function drawTargets() {
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

export function drawExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        ctx.fillStyle = `rgba(255, 165, 0, ${exp.alpha})`;
        ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2); ctx.fill();
        exp.radius += 0.5; exp.alpha -= 0.02;
        if (exp.alpha <= 0) explosions.splice(i, 1);
    }
}

export function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState !== 'title') {
        drawSeaBackground();
        for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            if (!r.stopped && r.radius < r.RIPPLE_MAX_RADIUS) r.radius += 0.8;
            if (!r.hitTarget && !r.stopped) {
                for (const target of targets) {
                    if (!target.sunk && Math.hypot(r.x - target.x, r.y - target.y) <= r.radius) {
                        r.hitTarget = true; r.stopped = true; break;
                    }
                }
            }
            if (!r.hitTarget && r.radius >= r.RIPPLE_MAX_RADIUS) r.stopped = true;
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
