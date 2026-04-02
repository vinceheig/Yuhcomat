import { EventBus } from '../EventBus';
import { GameWorld } from '../GameWorld';
import { Scene } from 'phaser';
import { getSoundVolume } from '../AudioConfig';

export class Game extends Scene
{
    gameWorld;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        const { width, height } = this.scale;
        const expectedPlayTimeSeconds = 60;

        this.cameras.main.setBackgroundColor(0x12321a);
        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height).setAlpha(0.35);

        this.sound.stopByKey('mainMenu');
        this.sound.stopByKey('game1');
        this.sound.stopByKey('game2');

        const gameMusic = Math.random() < 0.5 ? 'game1' : 'game2';
        this.sound.play(gameMusic, {
            loop: true,
            volume: getSoundVolume(gameMusic)
        });

        this.gameWorld = new GameWorld(this, {
            playerName: 'Player 1',
            life: 3,
            expectedPlayTimeSeconds,
            onGameOver: ({ score, elapsedSeconds, name }) => {
                this.scene.start('GameOver', {
                    score,
                    elapsedSeconds,
                    name
                });
            }
        });

        this.events.once('shutdown', () => {
            this.gameWorld?.destroy();
            this.gameWorld = null;
        });

        EventBus.emit('current-scene-ready', this);
    }

    update (time, delta)
    {
        this.gameWorld?.update(time, delta);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
