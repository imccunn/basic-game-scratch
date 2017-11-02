
import { loadSound, playSound } from './index';

export default class AudioFactory {
  constructor() {
    this.shipExplodes;
    this.pauseGame;
    this.weaponFires;
  }

  init() {
    console.log('init audio')
    return loadSound('weapon-fire')
      .then(buffer => this.weaponFires = buffer)
      .then(loadSound.bind(null, 'ship-explosion'))
      .then(buffer => this.shipExplodes = buffer)
      .then(loadSound.bind(null, 'pause-game'))
      .then(buffer => this.pauseGame = buffer);
  }

  playWeaponFire() {
    playSound(this.weaponFires, 0.5);
  }

  playShipExplosion() {
    playSound(this.shipExplodes, 1);
  }

  playPauseGame() {
    playSound(this.pauseGame, 1);
  }
}
