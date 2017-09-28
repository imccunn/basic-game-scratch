
export default class Sprite {
	constructor(opts) {
		this.context = opt.context;
		this.width = opt.width;
		this.height = opt.height;
		this.image = opt.image;
		this.numFrames = opt.numFrames;
		this.x = opt.x;
		this.y = opt.y;
		this.frameIndex = 0;
		this.tickCount = 0;
		this.ticksPerFrame = 1;
	}

	render() {
		this.context.clearRect(0, 0, this.width, this.height);
		this.context.drawImage(
			this.image, // image object
			0, // sx
			this.frameIndex * this.height / this.numFrames, // sy
			this.width, // sw
			this.height / this.numFrames , // sh
			this.x, // dx
			this.y, // dy
			this.width, // dw
			this.height / this.numFrames // dh
		);
	}

	update() {
		this.tickCount += 1;
		if (this.frameIndex === 49) this.frameIndex = 0;
		if (this.tickCount > this.ticksPerFrame) {
			this.tickCount = 0;
			if (this.frameIndex < this.numFrames - 1) {
				this.frameIndex++;
			}
		}
	}
}
