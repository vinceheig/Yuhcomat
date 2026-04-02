import { Obstacle } from './Obstacle';
import { getSoundVolume } from '../AudioConfig';

export class Bomb extends Obstacle {
    constructor(scene, config) {
        super(scene, {
            ...config,
            speed: config.speed ?? 320,
            textureKey: 'bomb',
            baseSize: 58,
            soundEffectToPlay: ['explosion1', 'explosion2'],
            blockedSoundEffectToPlay: 'shield',
            reactionToHits: (player) => {
                if (!player.isInvincible()) {
                    player.removeLife(1);

                    if (scene.cache.audio.exists('fahhh')) {
                        scene.sound.play('fahhh', {
                            volume: getSoundVolume('fahhh')
                        });
                    }
                }
            }
        });
    }
}
