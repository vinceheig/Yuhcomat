import { EventBus } from '../EventBus';
import Phaser, { Scene } from 'phaser';
import { getSoundVolume } from '../AudioConfig';

export class MainMenu extends Scene
{
    logoTween;
    startButton;
    howToPlayButton;
    menuButtons;
    selectedButtonIndex;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { width, height } = this.scale;
        const uiScale = Math.min(width / 1024, height / 768);

        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

        this.sound.stopByKey('game1');
        this.sound.stopByKey('game2');

        if (!this.sound.getAllPlaying().some((sound) => sound.key === 'mainMenu')) {
            this.sound.play('mainMenu', {
                loop: true,
                volume: getSoundVolume('mainMenu')
            });
        }

        this.logo = this.add.image(width / 2, height * 0.39, 'logo').setDepth(100).setScale(Math.max(0.45, uiScale));

        this.add.text(width / 2, height * 0.60, 'Main Menu', {
            fontFamily: 'Arial Black',
            fontSize: Math.max(24, Math.round(38 * uiScale)),
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: Math.max(4, Math.round(8 * uiScale)),
            align: 'center'
        }).setDepth(100).setOrigin(0.5);

        this.startButton = this.createMenuButton(
            width / 2,
            height * 0.72,
            'Start',
            () => {
                this.scene.start('Game');
            },
            uiScale
        );

        this.howToPlayButton = this.createMenuButton(
            width / 2,
            height * 0.82,
            'How To Play',
            () => {
                this.scene.start('HowToPlay');
            },
            uiScale
        );

        this.menuButtons = [this.startButton, this.howToPlayButton];
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
            const hoveredButtonIndex = this.menuButtons?.findIndex((button) => button.buttonBg === buttonBg) ?? -1;
            if (hoveredButtonIndex >= 0) {
                this.selectedButtonIndex = hoveredButtonIndex;
                this.refreshButtonFocus();
            }
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
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (vueCallback)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        }
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    vueCallback({
                        x: Math.floor(this.logo.x),
                        y: Math.floor(this.logo.y)
                    });
                }
            });
        }
    }
}
