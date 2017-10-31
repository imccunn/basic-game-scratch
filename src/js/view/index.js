
function fillBackDefault(ctx, width, height) {
  ctx.beginPath();
  ctx.rect(0, 0, width, width);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.closePath();
}

function drawRect(ctx, clr, posx, posy, size) {
  ctx.beginPath();
  ctx.rect(posx, posy, size, size);
  ctx.fillStyle = clr;
  ctx.fill();
}

export {
  fillBackDefault,
  drawRect
}
