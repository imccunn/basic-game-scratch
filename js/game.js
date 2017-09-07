// game.js

var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

$('#c').attr('width', canvasWidth);
$('#c').attr('height', canvasHeight);

var keysDown = {};
var keysUp = {};

$('body').bind('keydown', function(e) {
	console.log('e.which', e.which);
	keysDown[e.which] = true;
});

$('body').bind('keyup', function(e) {
	keysDown[e.which] = false;
});

var canvas = $('#c')[0].getContext('2d');

var image = new Image();
image.src = 'medfighter.png';
var plr = {};
var playerX = (canvasWidth/2) - (image.width/2);
var playerY = (canvasHeight/2) - (image.width/2);

function fillBackDefault() {
    canvas.beginPath();
    canvas.rect(0, 0, canvasWidth, canvasHeight);
    canvas.fillStyle = '#000';
    canvas.fill();
    canvas.closePath();
}



function update() {
	if (keysDown[65]) { //A
		playerX -= 10;
	}
	if (keysDown[87]) { //W
		playerY -= 10;
	}
	if (keysDown[68]) { //D
		playerX += 10;
	}
	if (keysDown[83]) { //S
		playerY += 10;
	}

	if (keysDown[32]) {
		plr.shooting = true;
	}

	playerX = clamp(playerX, 0, canvasWidth - image.width);
	playerY = clamp(playerY, 0, canvasHeight - image.height);
	updateStars();
}

function clamp(x, min, max) {
	return x < min ? min : (x > max ? max : x);
}

function draw() {
	fillBackDefault();
	canvas.strokeRect(0, 0, canvasWidth, canvasHeight);
	canvas.drawImage(image, playerX, playerY);
	drawStars();
}

function drawRect(clr, posx, posy, size) {
    canvas.beginPath();
    canvas.rect(posx, posy, size, size);
    canvas.fillStyle = clr;
    canvas.fill();
}

function drawBullets() {

}
var stars = [];
stars.length = 150;
stars.fill({});
stars = stars.map(function(s) {
	var distance = Math.random();
	var size = distance < 0.9 ? 1 : getRandomInt(2, 4);
	var trail = distance > 0.9 ? getRandomInt(5, 11) : null;
	return {
		x: getRandomInt(1, canvasWidth),
		y: getRandomInt(1, canvasHeight),
		distance: distance,
		size: size,
		trail: trail
	};
});
console.log('stars: ', stars);

function updateStars() {
	stars.forEach(function(s) {
		s.y += s.distance;
		if (s.y > canvasHeight) {
			s.y = -1;
			s.x = getRandomInt(1, canvasWidth);
		}
	});
}
function drawStars() {
	stars.forEach(function(s) {
		drawRect('#fff', s.x, s.y, s.size);
		if (s.trail) {
			for (var i = 0; i < s.trail; i++) {
				drawRect('rgba(255, 0, 155, ' + (0.05 * i+1) + ')', s.x, s.y - i * 3, s.size - (0.23 * i));
			}
		}
	});
}
// function drawStars() {
// 	for (var i = 0; i < 50; i++) {
// 		var x = getRandomInt(1, canvasWidth);
// 		var y = getRandomInt(1, canvasHeight);
// 		var size = getRandomInt(1, 4);
// 		drawRect('#fff', x, y, size);
// 	}
// }

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


var FPS = 30;
setInterval(function() {
	update();
	draw();
}, 1000 / FPS);
