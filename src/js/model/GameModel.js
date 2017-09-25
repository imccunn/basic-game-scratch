
const canvasWidth = 1100;
const canvasHeight = window.innerHeight;
let animator = null;

class GameModel {
  constructor() {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.timer = null;
    this.time = null;
    this.active = true;
    this.initEnemies = null
    this.animator = animator;
    this.time = 0;
    this.timer = setInterval(() => {
      if (this.active) {
        this.time++;
      }
    }, 1000);
  }
}

export default new GameModel();
