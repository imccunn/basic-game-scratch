import { ctx } from './CanvasContext';

function fillBackDefault(width, height) {
  ctx.beginPath();
  ctx.rect(0, 0, width, width);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.closePath();
}

function drawRect(clr, posx, posy, size) {
  ctx.beginPath();
  ctx.rect(posx, posy, size, size);
  ctx.fillStyle = clr;
  ctx.fill();
}

function drawCircle(x, y, radius, clr) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = clr;
  ctx.fill();
}

export {
  fillBackDefault,
  drawRect,
  drawCircle
};
