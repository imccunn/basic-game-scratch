

export default class Weapon {

  constructor(opts) {
    this.BULLET_TIMEOUT = opts.bulletTimeout;
    this.ticksUntilNextFire = 0;
    this.bulletSpeed = opts.bulletSpeed;

  }
  getBulletTimeout() {
    return this.BULLET_TIMEOUT;
  }
}
