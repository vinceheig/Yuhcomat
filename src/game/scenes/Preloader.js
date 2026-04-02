import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
        this.load.image('coin', 'coin.png');
        this.load.image('bomb', 'bomb.png');
        this.load.image('player', 'player.png');
        this.load.spritesheet('player-run-sheet', 'Run_sprite_sheet_22frame.png', {
            frameWidth: 1024,
            frameHeight: 576,
            endFrame: 21
        });
    }

    createGeneratedTexture (key, drawFn)
    {
        if (this.textures.exists(key))
        {
            return;
        }

        const gfx = this.make.graphics({ x: 0, y: 0, add: false });
        drawFn(gfx);
        gfx.generateTexture(key, 96, 96);
        gfx.destroy();
    }

    createGameplayTextures ()
    {
        this.createGeneratedTexture('coin', (gfx) => {
            gfx.fillStyle(0xf4d03f, 1);
            gfx.fillCircle(48, 48, 28);
            gfx.lineStyle(8, 0xf1c40f, 1);
            gfx.strokeCircle(48, 48, 28);
            gfx.lineStyle(4, 0xd4ac0d, 1);
            gfx.strokeCircle(48, 48, 18);
        });

        this.createGeneratedTexture('bomb', (gfx) => {
            gfx.fillStyle(0x2c3e50, 1);
            gfx.fillCircle(48, 58, 28);
            gfx.lineStyle(6, 0xe74c3c, 1);
            gfx.strokeCircle(48, 58, 28);
            gfx.fillStyle(0x7f8c8d, 1);
            gfx.fillRoundedRect(40, 18, 16, 18, 4);
            gfx.lineStyle(4, 0xf39c12, 1);
            gfx.beginPath();
            gfx.moveTo(48, 18);
            gfx.lineTo(62, 6);
            gfx.strokePath();
        });

        this.createGeneratedTexture('player', (gfx) => {
            gfx.fillStyle(0x1f6feb, 1);
            gfx.fillRoundedRect(18, 16, 60, 66, 14);
            gfx.lineStyle(6, 0xffffff, 1);
            gfx.strokeRoundedRect(18, 16, 60, 66, 14);
            gfx.fillStyle(0xffffff, 1);
            gfx.fillCircle(40, 38, 5);
            gfx.fillCircle(56, 38, 5);
            gfx.lineStyle(4, 0xffffff, 1);
            gfx.beginPath();
            gfx.moveTo(38, 54);
            gfx.lineTo(58, 54);
            gfx.strokePath();
        });
    }

    create ()
    {
        this.createGameplayTextures();

        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
