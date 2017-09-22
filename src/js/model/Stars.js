
import { getRand, getRandomInt } from '../util';
import gameModel from './GameModel';

let stars = [];
stars.length = 150;
stars.fill({});
stars = stars.map(function(s) {
	var distance = Math.random();
	var size = distance < 0.9 ? getRand(0.5, 2) : getRand(2, 4);
	var trail = distance > 0.9 ? getRandomInt(5, 11) : null;
	let randClr = getRandomInt(1, 3);
	let clr = null;
	switch(randClr) {
		case 1: clr = '#ffff00a';
			break;
		case 2: clr = '#aaaaff';
			break;
		case 3: clr = '#0000ff';
			break;
	}
	return {
		x: getRandomInt(1, gameModel.width),
		y: getRandomInt(1, gameModel.height),
		distance: distance,
		size: size,
		speed: 0.01 * -distance,
		trail: trail,
		clr: clr
	};
});
function initStars() {
  return stars;
}


export default initStars;
