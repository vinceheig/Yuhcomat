import { Obstacle } from './Obstacle';

export class StarBoost extends Obstacle {
    constructor(scene, config) {
        super(scene, {
            ...config,
            speed: config.speed ?? 320,
            textureKey: 'star',
            baseSize: 54,
            soundEffectToPlay: 'coin-hit',
            reactionToHits: (player) => {
                player.activateStarPowerup();
                config.onCollected?.(player);
            }
        });
    }
}
