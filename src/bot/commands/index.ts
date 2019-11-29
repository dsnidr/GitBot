import { Message, TextChannel } from "discord.js";
import clear from "./clear";
import subscribe from "./subscribe";

export default (command: string, args: string[], message: Message) => {
	switch (command) {
		case "clear":
			clear(message.channel as TextChannel);
			break;
		case "subscribe":
			subscribe(message, args);
			break;
	}
};
