import Phaser from 'phaser';

export class Player {
    constructor(scene, config) {
        this.scene = scene;
        this.name = config.name ?? 'Player';
        this.life = config.life ?? 3;
        this.score = config.score ?? 0;
        this.getLaneCenterXAtY = config.getLaneCenterXAtY;
        this.laneCount = config.laneCount;
        this.columnPosition = config.columnPosition ?? 1;
        this.y = config.y ?? scene.scale.height - 90;
        this.baseSize = config.baseSize ?? 72;
        this.hitboxWidth = config.hitboxWidth ?? Math.round(this.baseSize * 0.82);
        this.hitboxHeight = config.hitboxHeight ?? Math.round(this.baseSize * 0.98);
        this.defaultInvincibilityDurationMs = config.defaultInvincibilityDurationMs ?? 2500;
        this.invincibleUntilMs = 0;

        const startX = this.getLaneCenterXAtY(this.columnPosition, this.y);

        this.sprite = scene.add.sprite(
            startX,
            this.y,
            'player-run-sheet',
            0
        );
        this.sprite.setDisplaySize(Math.round(this.baseSize * 2), Math.round(this.baseSize * 2));

        if (!scene.anims.exists('player-run')) {
            scene.anims.create({
                key: 'player-run',
                frames: scene.anims.generateFrameNumbers('player-run-sheet', { start: 0, end: 21 }),
                frameRate: 18,
                repeat: -1
            });
        }

        this.sprite.play('player-run');

        this.hitbox = new Phaser.Geom.Rectangle(0, 0, this.sprite.displayWidth, this.sprite.displayHeight);
        this.syncHitbox();

        this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.leftKey) || Phaser.Input.Keyboard.JustDown(this.aKey)) {
            this.moveLeft();
        }

        if (Phaser.Input.Keyboard.JustDown(this.rightKey) || Phaser.Input.Keyboard.JustDown(this.dKey)) {
            this.moveRight();
        }

        if (this.isInvincible()) {
            this.sprite.setTint(0xfff4a3);
        } else {
            this.sprite.clearTint();
        }

        this.syncHitbox();
    }

    moveLeft() {
        this.columnPosition = Phaser.Math.Clamp(this.columnPosition - 1, 0, this.laneCount - 1);
        this.sprite.x = this.getLaneCenterXAtY(this.columnPosition, this.sprite.y);
    }

    moveRight() {
        this.columnPosition = Phaser.Math.Clamp(this.columnPosition + 1, 0, this.laneCount - 1);
        this.sprite.x = this.getLaneCenterXAtY(this.columnPosition, this.sprite.y);
    }

    activateStarPowerup(config = {}) {
        const now = this.scene.time.now;
        const invincibilityDurationMs = config.invincibilityDurationMs ?? this.defaultInvincibilityDurationMs;

        this.invincibleUntilMs = Math.max(this.invincibleUntilMs, now + invincibilityDurationMs);
    }

    isInvincible() {
        return this.scene.time.now < this.invincibleUntilMs;
    }

    addScore(amount) {
        this.score += amount;
    }

    removeLife(amount) {
        this.life = Math.max(this.life - amount, 0);
    }

    syncHitbox() {
        this.hitbox.x = this.sprite.x - this.hitboxWidth / 2;
        this.hitbox.y = this.sprite.y - this.hitboxHeight / 2;
        this.hitbox.width = this.hitboxWidth;
        this.hitbox.height = this.hitboxHeight;
    }

    destroy() {
        this.sprite.destroy();
    }
}
