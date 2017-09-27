import Entity from './Entity';

export default class Bullet extends Entity {
  constructor(opts) {
    super(opts);
    this.dead = opts.dead;
  }
}
