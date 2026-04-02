import { Obstacle } from './Obstacle';

export class Bomb extends Obstacle {
    constructor(scene, config) {
        super(scene, {
            ...config,
            speed: config.speed ?? 320,
            textureKey: 'bomb',
            baseSize: 58,
            soundEffectToPlay: 'bomb-hit',
            reactionToHits: (player) => {
                if (!player.isInvincible()) {
                    player.removeLife(1);
                }
            }
        });
    }
}
