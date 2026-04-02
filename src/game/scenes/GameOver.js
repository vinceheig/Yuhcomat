import { EventBus } from '../EventBus';
import Phaser, { Scene } from 'phaser';

export class GameOver extends Scene
{
    menuButtons;
    selectedButtonIndex;

    constructor ()
    {
        super('GameOver');
    }

    create (data)
    {
        const { width, height } = this.scale;
        const uiScale = Math.min(width / 1024, height / 768);

        this.cameras.main.setBackgroundColor(0xff0000);

        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height).setAlpha(0.5);

        this.add.text(width / 2, height * 0.39, 'Game Over', {
            fontFamily: 'Arial Black',
            fontSize: Math.max(38, Math.round(64 * uiScale)),
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: Math.max(4, Math.round(8 * uiScale)),
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const name = data?.name ?? 'Player';
        const score = data?.score ?? 0;
        const elapsedSeconds = data?.elapsedSeconds ?? 0;

        this.add.text(width / 2, height * 0.55, `Name: ${name}\nScore: ${score}\nTime: ${elapsedSeconds}s`, {
            fontFamily: 'Arial Black',
            fontSize: Math.max(20, Math.round(32 * uiScale)),
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: Math.max(3, Math.round(6 * uiScale)),
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const mainMenuButton = this.createMenuButton(
            width / 2,
            height * 0.79,
            'Main Menu',
            () => {
                this.scene.start('MainMenu');
            },
            uiScale
        );

        this.menuButtons = [mainMenuButton];
        this.selectedButtonIndex = 0;
        this.refreshButtonFocus();
        this.configureKeyboardNavigation();

        this.events.once('shutdown', () => {
            this.input.keyboard?.off('keydown-SPACE', this.handleConfirmSelection, this);
            this.input.keyboard?.off('keydown-ENTER', this.handleConfirmSelection, this);
        });

        EventBus.emit('current-scene-ready', this);
    }

    createMenuButton (x, y, label, onClick, uiScale)
    {
        const width = Math.round(280 * uiScale);
        const height = Math.round(64 * uiScale);
        const buttonBg = this.add.rectangle(x, y, width, height, 0x1c2b5d, 0.9)
            .setStrokeStyle(Math.max(2, Math.round(3 * uiScale)), 0xffffff, 1)
            .setDepth(120)
            .setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, label, {
            fontFamily: 'Arial Black',
            fontSize: Math.max(20, Math.round(30 * uiScale)),
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(121);

        buttonBg.on('pointerover', () => {
            this.selectedButtonIndex = 0;
            this.refreshButtonFocus();
        });

        buttonBg.on('pointerout', () => {
            this.refreshButtonFocus();
        });

        buttonBg.on('pointerdown', () => {
            onClick();
        });

        return { buttonBg, buttonText, onClick };
    }

    configureKeyboardNavigation ()
    {
        this.upKey = this.input.keyboard.addKey('UP');
        this.downKey = this.input.keyboard.addKey('DOWN');
        this.leftKey = this.input.keyboard.addKey('LEFT');
        this.rightKey = this.input.keyboard.addKey('RIGHT');

        this.handleConfirmSelection = () => {
            const selectedButton = this.menuButtons[this.selectedButtonIndex];
            selectedButton?.onClick?.();
        };

        this.input.keyboard.on('keydown-SPACE', this.handleConfirmSelection, this);
        this.input.keyboard.on('keydown-ENTER', this.handleConfirmSelection, this);
    }

    refreshButtonFocus ()
    {
        for (let i = 0; i < this.menuButtons.length; i += 1) {
            const isSelected = i === this.selectedButtonIndex;
            const button = this.menuButtons[i];

            button.buttonBg.setFillStyle(isSelected ? 0x2c478a : 0x1c2b5d, isSelected ? 1 : 0.9);
            button.buttonBg.setScale(isSelected ? 1.04 : 1);
            button.buttonText.setScale(isSelected ? 1.04 : 1);
            button.buttonBg.setStrokeStyle(isSelected ? 4 : 3, 0xffffff, 1);
        }
    }

    update ()
    {
        if (!this.menuButtons || this.menuButtons.length === 0) {
            return;
        }

        if (this.upKey && Phaser.Input.Keyboard.JustDown(this.upKey)) {
            this.selectedButtonIndex = Phaser.Math.Wrap(this.selectedButtonIndex - 1, 0, this.menuButtons.length);
            this.refreshButtonFocus();
        }

        if (this.downKey && Phaser.Input.Keyboard.JustDown(this.downKey)) {
            this.selectedButtonIndex = Phaser.Math.Wrap(this.selectedButtonIndex + 1, 0, this.menuButtons.length);
            this.refreshButtonFocus();
        }

        if (this.leftKey && Phaser.Input.Keyboard.JustDown(this.leftKey)) {
            this.selectedButtonIndex = Phaser.Math.Wrap(this.selectedButtonIndex - 1, 0, this.menuButtons.length);
            this.refreshButtonFocus();
        }

        if (this.rightKey && Phaser.Input.Keyboard.JustDown(this.rightKey)) {
            this.selectedButtonIndex = Phaser.Math.Wrap(this.selectedButtonIndex + 1, 0, this.menuButtons.length);
            this.refreshButtonFocus();
        }
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
