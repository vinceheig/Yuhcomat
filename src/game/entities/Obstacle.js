import Phaser from 'phaser';

export class Obstacle {
    constructor(scene, config) {
        this.scene = scene;
        this.speed = config.speed ?? 220;
        this.columnPosition = config.columnPosition ?? 1;
        this.getLaneCenterXAtY = config.getLaneCenterXAtY;
        this.spawnY = config.y ?? 70;
        this.playerY = config.playerY ?? scene.scale.height - 100;
        this.minScale = config.minScale ?? 0.3;
        this.maxScale = config.maxScale ?? 1.35;
        this.textureKey = config.textureKey ?? 'star';
        this.baseSize = config.baseSize ?? 56;

        this.floatAmplitude = config.floatAmplitude ?? Math.max(4.5, this.baseSize * 0.07);
        this.floatSpeed = config.floatSpeed ?? 12;
        this.floatTime = Phaser.Math.FloatBetween(0, Math.PI * 2);
        
        this.travelY = this.spawnY;
        this.reactionToHits = config.reactionToHits ?? (() => {});
        this.soundEffectToPlay = config.soundEffectToPlay ?? null;

        const startX = this.getLaneCenterXAtY(this.columnPosition, this.spawnY);

        this.sprite = scene.add.image(
            startX,
            this.spawnY,
            this.textureKey
        );
        this.sprite.setDisplaySize(this.baseSize, this.baseSize);
        this.sprite.setScale(this.minScale);

        this.hitbox = new Phaser.Geom.Rectangle(0, 0, this.sprite.displayWidth, this.sprite.displayHeight);
        this.hitboxs = this.hitbox;
        this.syncHitbox();
    }

    update(delta) {
        const deltaSeconds = delta / 1000;
        this.travelY += this.speed * deltaSeconds;
        this.floatTime += this.floatSpeed * deltaSeconds;

        const floatOffsetY = Math.sin(this.floatTime) * this.floatAmplitude;

        this.sprite.x = this.getLaneCenterXAtY(this.columnPosition, this.travelY);
        this.sprite.y = this.travelY + floatOffsetY;

        const approachProgress = Phaser.Math.Clamp(
            (this.travelY - this.spawnY) / (this.playerY - this.spawnY),
            0,
            1
        );
        this.sprite.setScale(Phaser.Math.Linear(this.minScale, this.maxScale, approachProgress));

        this.syncHitbox();
    }

    tryHit(player) {
        if (!Phaser.Geom.Intersects.RectangleToRectangle(this.hitbox, player.hitbox)) {
            return false;
        }

        if (this.soundEffectToPlay && this.scene.cache.audio.exists(this.soundEffectToPlay)) {
            this.scene.sound.play(this.soundEffectToPlay);
        }

        this.reactionToHits(player, this);
        return true;
    }

    isOutOfBounds() {
        return this.travelY - this.sprite.displayHeight > this.scene.scale.height;
    }

    syncHitbox() {
        this.hitbox.x = this.sprite.x - this.sprite.displayWidth / 2;
        this.hitbox.y = this.sprite.y - this.sprite.displayHeight / 2;
        this.hitbox.width = this.sprite.displayWidth;
        this.hitbox.height = this.sprite.displayHeight;
    }

    destroy() {
        this.sprite.destroy();
    }
}
