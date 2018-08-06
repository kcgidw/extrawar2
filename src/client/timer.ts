export class Timer {
	startTime: Date;
	elapsedMs: number;
	durationMs: number;
	onTick: ()=>any;
	onEnd: ()=>any;

	alive: boolean;

	constructor(durationMs: number, onTick: ()=>any, onEnd: ()=>any) {
		this.startTime = new Date();
		this.elapsedMs = 0;
		this.durationMs = durationMs;
		this.onTick = onTick;
		this.onEnd = onEnd;
		this.start();
	}

	start() {
		this.alive = true;

		var t = () => {
			setTimeout(() => {
				if(this.tick() && this.alive) {
					t();
				}
			}, 1000);
		}
		t();
	}
	tick(): boolean {
		this.elapsedMs = new Date().getTime() - this.startTime.getTime();
		if(this.timeLeftMs() <= 0) {
			this.end();
			return false;
		}
		this.onTick();
		return true;
	}
	end() {
		this.onEnd();
		this.kill();
	}
	kill() {
		this.alive = false;
	}
	timeLeftMs() {
		return this.durationMs - this.elapsedMs;
	}
}