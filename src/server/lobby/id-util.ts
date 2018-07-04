const ID_LENGTH = 4;
const CHARS = 'abcdefgh123456789'; // 0 is confusing

function randInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min)) + min;
}
function randChar(chars: string): string {
	return chars.charAt(randInt(0, chars.length));
}

function makeId(): string {
	var id = '';
	for(let i=0; i < ID_LENGTH; i++) {
		let char = randChar(CHARS);
		id += char;
	}
	return id; // TODO add prefix for debugging clarity
}

export {
	randChar, randInt, makeId
};
