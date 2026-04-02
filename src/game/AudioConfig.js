export const SOUND_VOLUMES = {
    explosion1: 0.2,
    explosion2: 0.2,
    fahhh: 0.5,
    bonus: 0.4,
    shield: 0.4,
    coins: 0.4,
    bell1: 0.4,
    pl_step1: 0.1,
    pl_step2: 0.1,
    pl_step3: 0.1,
    pl_step4: 0.1,
    game1: 0.3,
    game2: 0.3,
    mainMenu: 0.3
};

export function getSoundVolume(soundKey) {
    return SOUND_VOLUMES[soundKey] ?? 1;
}
