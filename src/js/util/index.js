
function clamp(x, min, max) {
	return x < min ? min : (x > max ? max : x);
}

export {
  clamp
}
