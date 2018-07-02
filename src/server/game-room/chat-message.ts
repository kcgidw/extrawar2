import { User } from "../lobby/user";

export class ChatMessage {
	poster: User;
	message: string;

	constructor(poster: User, message: string) {
		this.poster = poster;
		this.message = message;
	}
}
