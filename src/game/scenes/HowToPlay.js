import { EventBus } from '../EventBus';
import Phaser, { Scene } from 'phaser';

export class HowToPlay extends Scene
{
    menuButtons;
    selectedButtonIndex;

    constructor ()
    {
        super('HowToPlay');
    }

    create ()
    {
        const { width, height } = this.scale;
        const uiScale = Math.min(width / 1024, height / 768);

        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height).setAlpha(0.55);

        this.add.text(width / 2, height * 0.1, 'How To Play', {
            fontFamily: 'Arial Black',
            fontSize: Math.max(28, Math.round(44 * uiScale)),
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: Math.max(4, Math.round(7 * uiScale))
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.17, 'Move with Left/Right or A/D. Avoid bombs and collect boosts.', {
            fontFamily: 'Arial',
            fontSize: Math.max(16, Math.round(22 * uiScale)),
            color: '#f7f7f7',
            stroke: '#000000',
            strokeThickness: Math.max(2, Math.round(3 * uiScale))
        }).setOrigin(0.5);

        const entries = [
            {
                key: 'player-run-sheet',
                isSpriteSheet: true,
                title: 'Player',
                description: 'Your runner. Dodge dangers and stay alive.'
            },
            {
                key: 'coin',
                title: 'Coin',
                description: 'Collect to gain score points.'
            },
            {
                key: 'bomb',
                title: 'Bomb',
                description: 'Hit it and lose 1 life, unless invincible.'
            },
            {
                key: 'star',
                title: 'Star',
                description: 'Gives invincibility and speeds up obstacle spawn for a short time.'
            }
        ];

        const startX = width * 0.2;
        const gapX = width * 0.2;
        const rowY = height * 0.45;

        entries.forEach((entry, index) => {
            const x = startX + (index * gapX);
            const iconScale = Math.max(0.9, uiScale);
            let icon;

            if (entry.isSpriteSheet) {
                icon = this.add.sprite(x, rowY, entry.key, 0).setScale(iconScale * 0.55);

                if (!this.anims.exists('player-run-tutorial')) {
                    this.anims.create({
                        key: 'player-run-tutorial',
                        frames: this.anims.generateFrameNumbers('player-run-sheet', { start: 0, end: 21 }),
                        frameRate: 18,
                        repeat: -1
                    });
                }

                icon.play('player-run-tutorial');
            } else {
                icon = this.add.image(x, rowY, entry.key).setScale(iconScale * 0.75);
            }

            icon.setDepth(10);

            this.add.text(x, rowY + (90 * uiScale), entry.title, {
                fontFamily: 'Arial Black',
                fontSize: Math.max(16, Math.round(24 * uiScale)),
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: Math.max(2, Math.round(4 * uiScale)),
                align: 'center'
            }).setOrigin(0.5);

            this.add.text(x, rowY + (136 * uiScale), entry.description, {
                fontFamily: 'Arial',
                fontSize: Math.max(13, Math.round(18 * uiScale)),
                color: '#f1f5ff',
                stroke: '#000000',
                strokeThickness: Math.max(1, Math.round(2 * uiScale)),
                align: 'center',
                wordWrap: { width: Math.round(200 * uiScale) }
            }).setOrigin(0.5, 0);
        });

        const startButton = this.createMenuButton(width / 2, height * 0.84, 'Start Game', () => {
            this.scene.start('Game');
        }, uiScale);

        const backButton = this.createMenuButton(width / 2, height * 0.92, 'Back', () => {
            this.scene.start('MainMenu');
        }, uiScale);

        this.menuButtons = [startButton, backButton];
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
        const width = Math.round(250 * uiScale);
        const height = Math.round(56 * uiScale);
        const button = this.add.rectangle(x, y, width, height, 0x1c2b5d, 0.92)
            .setStrokeStyle(Math.max(2, Math.round(3 * uiScale)), 0xffffff, 1)
            .setInteractive({ useHandCursor: true })
            .setDepth(20);

        const text = this.add.text(x, y, label, {
            fontFamily: 'Arial Black',
            fontSize: Math.max(18, Math.round(26 * uiScale)),
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(21);

        button.on('pointerover', () => {
            const hoveredButtonIndex = this.menuButtons?.findIndex((menuButton) => menuButton.button === button) ?? -1;
            if (hoveredButtonIndex >= 0) {
                this.selectedButtonIndex = hoveredButtonIndex;
                this.refreshButtonFocus();
            }
        });

        button.on('pointerout', () => {
            this.refreshButtonFocus();
        });

        button.on('pointerdown', () => {
            onClick();
        });

        return { button, text, onClick };
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

            button.button.setFillStyle(isSelected ? 0x2c478a : 0x1c2b5d, isSelected ? 1 : 0.92);
            button.button.setScale(isSelected ? 1.03 : 1);
            button.text.setScale(isSelected ? 1.03 : 1);
            button.button.setStrokeStyle(isSelected ? 4 : 3, 0xffffff, 1);
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
}
