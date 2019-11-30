import { Message, RichEmbed, TextChannel } from "discord.js";
import isGitHubUrl from "../../helpers/isGitHubUrl";

export default (message: Message, args: string[]): void => {
	// We don't want to handle this command unless it was used within a server.
	if ((message.channel as TextChannel).guild == null) return;

	if (args.length !== 1) {
		error(message);
		return;
	}

	const successEmbed = new RichEmbed();
	successEmbed.setTitle("Request Received");
	successEmbed.setDescription("I've sent you some instructions. Please check your DMs");
	successEmbed.setColor("#00FF00");
	message.reply(successEmbed);

	const repoUrl: string = args[0];

	if (!isGitHubUrl(repoUrl)) {
		error(message);
		return;
	}

	message.author.send(`Please visit the following page to authenticate yourself: \
	\n\nhttp://localhost:8080/auth/github?repo=${new Buffer(args[0]).toString("base64")} \
	\n\nThis is an OAuth login process done through GitHub. We never have access to your login credentials. \
	\nTo learn more about how OAuth works, check out https://oauth.net`);
};

const error = (message: Message) => {
	const embed: RichEmbed = new RichEmbed();
	embed.setTitle("Incorrect usage");
	embed.setDescription("Usage: !subscribe <Repo URL>");
	embed.setColor("#ff0000");

	message.reply(embed);
};
