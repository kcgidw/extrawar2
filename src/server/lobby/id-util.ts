const ID_LENGTH = 5;
const CHARS = 'ABCDEF0123456789';

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
	return id;
}

export {
	randChar, randInt, makeId
};
