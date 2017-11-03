import Entity from './Entity';

export default class Bullet extends Entity {
  constructor(opts) {
    super(opts);
    this.dead = opts.dead;
    this.color = opts.color;
    this.xSpeed = opts.xSpeed;
    this.ySpeed = opts.ySpeed;
  }
}
