const ID_LENGTH = 4;
const CHARS = 'abcdefgh123456789'; // 0 is confusing

export function randInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min)) + min;
}
export function randItem<T>(arr: T[]): T {
	if(arr.length === 0) {
		return undefined;
	}
	var idx = randInt(0, arr.length);
	return arr[idx];
}
function randChar(chars: string): string {
	return chars.charAt(randInt(0, chars.length));
}

export function makeId(): string {
	var id = '';
	for(let i=0; i < ID_LENGTH; i++) {
		let char = randChar(CHARS);
		id += char;
	}
	return id; // TODO add prefix for debugging clarity
}


export function shuffle<T>(arr: T[]): void {
	arr.sort(() => {
		return 0.5 - Math.random();
	});
}