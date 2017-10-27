
import { getRand, getRandomInt } from '../util';
import gameModel from './GameModel';

const numStars = 150;
let stars = [];

for (let i = 0; i < numStars; i++) {
	let distance = Math.random();
	let size = distance < 0.9 ? getRand(0.5, 2) : getRand(2, 4);
	let trail = distance > 0.9 ? getRandomInt(5, 11) : null;
	let randClr = getRandomInt(1, 3);
	let clr = null;

	switch(randClr) {
		case 1: clr = '#ffff00';
			break;
		case 2: clr = '#aaaaff';
			break;
		case 3: clr = '#0000ff';
			break;
	}

	stars.push({
		x: getRandomInt(1, gameModel.width),
		y: getRandomInt(1, gameModel.height),
		distance: distance,
		size: size,
		speed: 0.01 * -distance,
		trail: trail,
		clr: clr
	});
}

function initStars() {
  return stars;
}

export default initStars;
