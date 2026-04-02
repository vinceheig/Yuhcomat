import { Obstacle } from './Obstacle';

export class Coin extends Obstacle {
    constructor(scene, config) {
        super(scene, {
            ...config,
            speed: config.speed ?? 320,
            textureKey: 'coin',
            baseSize: 52,
            soundEffectToPlay: 'coins',
            reactionToHits: (player) => {
                player.addScore(10);
            }
        });
    }
}
