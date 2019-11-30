import { Message, RichEmbed, TextChannel } from "discord.js";
import isGitHubUrl from "../../helpers/isGitHubUrl";
import { IAuthState } from "../../interfaces";
import { getWebhookByChannel } from "../../database/webhook";

// TODO: Logging

export default async (message: Message, args: string[]): Promise<void> => {
	// We don't want to handle this command unless it was used within a server.
	if ((message.channel as TextChannel).guild == null) return;

	if (args.length !== 1) {
		error(message);
		return;
	}

	const repoUrl: string = args[0];

	if (!isGitHubUrl(repoUrl)) {
		error(message);
		return;
	}

	// Ensure that this channel isn't already subscribed to a repository
	const existingWebhook = await getWebhookByChannel(message.channel.id);
	if (existingWebhook) {
		const embed: RichEmbed = new RichEmbed();
		embed.setTitle("Error");
		embed.setDescription("This channel is already subscribed to a repository");
		embed.setColor("#ff0000");
		message.reply(embed);

		return;
	}

	const successEmbed = new RichEmbed();
	successEmbed.setTitle("Request Received");
	successEmbed.setDescription("I've sent you some instructions. Please check your DMs");
	successEmbed.setColor("#00FF00");
	message.reply(successEmbed);

	const authState: IAuthState = {
		repoUrl,
		guildId: message.guild.id,
		channelId: message.channel.id
	};

	const encodedState: string = Buffer.from(JSON.stringify(authState), "ascii").toString("base64");

	message.author.send(`Please visit the following page to authenticate yourself: \
	\n\nhttp://localhost:8080/auth/github?state=${encodedState} \
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
