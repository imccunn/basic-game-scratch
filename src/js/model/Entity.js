
export default class Entity {
  constructor(opts) {
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.width = opts.width || 0;
    this.height = opts.height || 0;
    this.speed = opts.speed || 0;
  }

  collision(target) {
    const sourceXLo = this.x;
    const sourceXHi = sourceXLo + this.width;
    const sourceYLo = this.y;
    const sourceYHi = sourceYLo + this.height;

    const targetXLo = target.x;
    const targetXHi = targetXLo + target.width;
    const targetYLo = target.y;
    const targetYHi = targetYLo + target.height;

    const xOverlap = (sourceXLo <= targetXHi) && (sourceXHi >= targetXLo);
    const yOverlap = (sourceYLo <= targetYHi) && (sourceYHi >= targetYLo);

    return xOverlap && yOverlap;
  }

  update() {

  }
}
