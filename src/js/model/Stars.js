
import { getRand, getRandomInt } from '../util';
import gameModel from './GameModel';

const numStars = 350;
let stars = [];

for (let i = 0; i < numStars; i++) {
	let distance = getRand(0.5, 1);
	let size = distance < 0.9 ? getRand(0.5, 2) : getRand(2, 4);
	let trail = distance > 0.99 ? getRandomInt(5, 11) : null;
	let randClr = getRandomInt(1, 4);
	let clr = null;

	switch(randClr) {
		case 1: clr = '#ffff00';
			break;
		case 2: clr = '#aaaaff';
			break;
		case 4: clr = '#0000ff';
			break;
		case 3: clr = '#ff0000';
			break;
	}

	stars.push({
		x: getRandomInt(1, gameModel.width),
		y: getRandomInt(1, gameModel.height),
		distance: distance,
		size: size,
		speed: (0.2 * distance),
		trail: trail,
		clr: clr
	});
}

function initStars() {
  return stars;
}

export default initStars;
