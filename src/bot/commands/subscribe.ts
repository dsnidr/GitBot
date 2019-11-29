import { Message, RichEmbed } from "discord.js";
import { isURL } from "validator";

export default (message: Message, args: string[]): void => {
	if (args.length !== 1) {
		error(message);
		return;
	}

	const repoURI: string = args[0];

	if (!isURL(repoURI)) {
		error(message);
		return;
	}

	message.author.sendMessage(
		`Please visit the following page to authenticate yourself:

		http://localhost:8080/auth/github

This is an OAuth login process done through GitHub. To learn more about
how this works, check out https://oauth.net`
	);
};

const error = (message: Message) => {
	const embed: RichEmbed = new RichEmbed();
	embed.setTitle("Incorrect usage");
	embed.setDescription("Usage: !subscribe <Repo URL>");
	embed.setColor("#ff0000");

	message.reply(embed);
};
