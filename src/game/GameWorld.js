import Phaser from 'phaser';
import { Bomb } from './entities/Bomb';
import { Coin } from './entities/Coin';
import { Player } from './entities/Player';
import { StarBoost } from './entities/StarBoost';

export class GameWorld {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.width = scene.scale.width;
        this.height = scene.scale.height;
        this.gameScale = Math.min(this.width / 1024, this.height / 768);
        this.uiScale = Phaser.Math.Clamp(this.gameScale, 0.7, 1.5);

        this.laneCount = 3;
        //En haut départ des colonnes
        this.horizonY = Math.floor(this.height * 0.2);
        //
        this.laneTopXs = [
            this.width * 0.492,
            this.width * 0.498,
            this.width * 0.512,
            this.width * 0.518
        ];
        //
        this.laneBottomXs = [
            this.width * 0.40,
            this.width * 0.48,
            this.width * 0.56,
            this.width * 0.64
        ];
        this.playerY = this.height - 105;

        this.player = new Player(scene, {
            name: config.playerName ?? 'Runner',
            life: config.life ?? 3,
            score: 0,
            getLaneCenterXAtY: this.getLaneCenterXAtY.bind(this),
            laneCount: this.laneCount,
            columnPosition: 1,
            y: this.playerY,
            baseSize: Math.round(72 * this.gameScale)
        });

        this.obstacles = [];
        this.startTime = null;
        this.elapsedSeconds = 0;
        this.expectedPlayTimeSeconds = Math.max(1, config.expectedPlayTimeSeconds ?? 120);
        
        this.baseSpawnsPerSecond = Math.max(0.1, config.baseSpawnsPerSecond ?? (1000 / 700));
        this.targetSpawnsPerSecond = Math.max(this.baseSpawnsPerSecond, config.targetSpawnsPerSecond ?? 4.2);
        this.maxSpawnsPerSecond = Math.max(this.targetSpawnsPerSecond, config.maxSpawnsPerSecond ?? 7.5);
        
        this.initialStarSpawnChance = Phaser.Math.Clamp(config.initialStarSpawnChance ?? 0.14, 0, 1);
        this.minimumStarSpawnChance = Phaser.Math.Clamp(config.minimumStarSpawnChance ?? 0.02, 0, this.initialStarSpawnChance);
        this.coinChanceWithoutStar = Phaser.Math.Clamp(config.coinChanceWithoutStar ?? 0.69, 0, 1);
        
        this.spawnBoostMultiplier = config.spawnBoostMultiplier ?? 3.8;
        this.spawnBoostDurationMs = config.spawnBoostDurationMs ?? 1000;
        this.spawnBoostUntilMs = 0;
        this.spawnAccumulatorMs = 0;

        this.gameOver = false;
        this.onGameOver = config.onGameOver ?? (() => {});

        this.drawLaneGuides();
        this.createUI();
        this.startSpawnLogic();
    }

    drawLaneGuides() {
        const graphics = this.scene.add.graphics();
        graphics.clear();
        graphics.lineStyle(Math.max(2, Math.round(5 * this.gameScale)), 0x000000, 0.9);

        for (let i = 0; i < this.laneTopXs.length; i += 1) {
            graphics.lineBetween(
                this.laneTopXs[i],
                this.horizonY,
                this.laneBottomXs[i],
                this.height - 18
            );
        }

        graphics.setDepth(0);
        this.laneGuides = graphics;
    }

    getBoundaryXAtY(boundaryIndex, y) {
        const clampedY = Phaser.Math.Clamp(y, this.horizonY, this.height - 18);
        const t = (clampedY - this.horizonY) / ((this.height - 18) - this.horizonY);
        return Phaser.Math.Linear(this.laneTopXs[boundaryIndex], this.laneBottomXs[boundaryIndex], t);
    }

    getLaneCenterXAtY(laneIndex, y) {
        const leftX = this.getBoundaryXAtY(laneIndex, y);
        const rightX = this.getBoundaryXAtY(laneIndex + 1, y);
        return (leftX + rightX) * 0.5;
    }

    createUI() {
        const style = {
            fontFamily: 'Arial Black',
            fontSize: Math.max(16, Math.round(24 * this.uiScale)),
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: Math.max(3, Math.round(5 * this.uiScale))
        };

        this.nameText = this.scene.add.text(18 * this.uiScale, 16 * this.uiScale, '', style).setDepth(10);
        this.lifeText = this.scene.add.text(18 * this.uiScale, 52 * this.uiScale, '', style).setDepth(10);
        this.scoreText = this.scene.add.text(18 * this.uiScale, 88 * this.uiScale, '', style).setDepth(10);
        this.powerupText = this.scene.add.text(18 * this.uiScale, 124 * this.uiScale, '', style).setDepth(10);
        this.timerText = this.scene.add.text(this.width - (220 * this.uiScale), 16 * this.uiScale, '', style).setDepth(10);

        this.refreshUI();
    }

    startSpawnLogic() {
        this.spawnAccumulatorMs = 0;
    }

    getCurrentSpawnRate() {
        const progress = this.elapsedSeconds / this.expectedPlayTimeSeconds;
        const growth = Math.log(this.targetSpawnsPerSecond / this.baseSpawnsPerSecond);
        const exponentialRate = this.baseSpawnsPerSecond * Math.exp(growth * progress);
        const baseRate = Math.min(exponentialRate, this.maxSpawnsPerSecond);
        const boostedRate = this.isSpawnBoostActive() ? baseRate * this.spawnBoostMultiplier : baseRate;
        const boostedCap = this.maxSpawnsPerSecond * this.spawnBoostMultiplier;

        return Math.min(boostedRate, boostedCap);
    }

    activateSpawnBoost(durationMs = this.spawnBoostDurationMs) {
        const now = this.scene.time.now;
        this.spawnBoostUntilMs = Math.max(this.spawnBoostUntilMs, now + durationMs);
    }

    isSpawnBoostActive() {
        return this.scene.time.now < this.spawnBoostUntilMs;
    }

    getCurrentStarSpawnChance() {
        const progress = Phaser.Math.Clamp(this.elapsedSeconds / this.expectedPlayTimeSeconds, 0, 1);
        return Phaser.Math.Linear(this.initialStarSpawnChance, this.minimumStarSpawnChance, progress);
    }

    spawnRandomObstacle() {
        const columnPosition = Phaser.Math.Between(0, this.laneCount - 1);
        const randomValue = Math.random();
        const currentStarSpawnChance = this.getCurrentStarSpawnChance();
        let obstacle;

        if (randomValue < currentStarSpawnChance) {
            obstacle = new StarBoost(this.scene, {
                columnPosition,
                y: this.horizonY + 8,
                getLaneCenterXAtY: this.getLaneCenterXAtY.bind(this),
                playerY: this.playerY,
                baseSize: Math.round(54 * this.gameScale),
                minScale: 0.01,
                maxScale: 0.28,
                onCollected: () => {
                    this.activateSpawnBoost();
                }
            });
        } else if (Math.random() < this.coinChanceWithoutStar) {
            obstacle = new Coin(this.scene, {
                columnPosition,
                y: this.horizonY + 8,
                getLaneCenterXAtY: this.getLaneCenterXAtY.bind(this),
                playerY: this.playerY,
                baseSize: Math.round(52 * this.gameScale),
                minScale: 0.01,
                maxScale: 0.28
            });
        } else {
            obstacle = new Bomb(this.scene, {
                columnPosition,
                y: this.horizonY + 8,
                getLaneCenterXAtY: this.getLaneCenterXAtY.bind(this),
                playerY: this.playerY,
                baseSize: Math.round(58 * this.gameScale),
                minScale: 0.01,
                maxScale: 0.28
            });
        }

        this.obstacles.push(obstacle);
    }

    update(time, delta) {
        if (this.gameOver) {
            return;
        }

        if (this.startTime === null) {
            this.startTime = time;
        }

        this.elapsedSeconds = Math.floor((time - this.startTime) / 1000);

        const spawnRate = this.getCurrentSpawnRate();
        const spawnIntervalMs = 1000 / spawnRate;
        this.spawnAccumulatorMs += delta;

        while (this.spawnAccumulatorMs >= spawnIntervalMs) {
            this.spawnRandomObstacle();
            this.spawnAccumulatorMs -= spawnIntervalMs;
        }

        this.player.update();

        for (let i = this.obstacles.length - 1; i >= 0; i -= 1) {
            const obstacle = this.obstacles[i];
            obstacle.update(delta);

            if (obstacle.tryHit(this.player)) {
                obstacle.destroy();
                this.obstacles.splice(i, 1);
                continue;
            }

            if (obstacle.isOutOfBounds()) {
                obstacle.destroy();
                this.obstacles.splice(i, 1);
            }
        }

        this.refreshUI();

        if (this.player.life <= 0) {
            this.endGame();
        }
    }

    refreshUI() {
        this.nameText.setText(`Name: ${this.player.name}`);
        this.lifeText.setText(`Life: ${this.player.life}`);
        this.scoreText.setText(`Score: ${this.player.score}`);
        this.powerupText.setText(`Power-up: ${this.player.isInvincible() ? 'Invincible + Spawn Boost' : 'None'}`);
        this.timerText.setText(`Timer: ${this.elapsedSeconds}s`);
    }

    endGame() {
        this.gameOver = true;

        this.onGameOver({
            score: this.player.score,
            elapsedSeconds: this.elapsedSeconds,
            name: this.player.name
        });
    }

    destroy() {
        for (const obstacle of this.obstacles) {
            obstacle.destroy();
        }

        this.obstacles = [];

        if (this.laneGuides) {
            this.laneGuides.destroy();
        }

        this.nameText?.destroy();
        this.lifeText?.destroy();
        this.scoreText?.destroy();
        this.powerupText?.destroy();
        this.timerText?.destroy();
        this.player.destroy();
    }
}
