import Discord, { TextChannel, Channel, RichEmbed, Message } from "discord.js";
import bot from "./bot";
import server from "./server";
import keys from "./config/keys";

import deleteMessages from "./bot/actions/deleteMessages";

bot.on("message", (message: Message) => {
	if (message.content === "embed test") {
		const embed = new Discord.RichEmbed();
		embed.setTitle("Embed test");
		embed.setColor("0xFF0000");
		embed.setDescription("Hey! This is an embed.");

		message.channel.send(embed);
	} else if (message.content === "!channels") {
		let availableChannels = "Here's the list of channels I have access to: \n\n";

		bot.channels.forEach((channel: Channel) => {
			availableChannels += channel.id + "\n";
		});

		const embed: RichEmbed = new RichEmbed();
		embed.setTitle("Embed test");
		embed.setColor("0xFF0000");
		embed.setDescription(availableChannels);

		message.channel.send(embed);
	} else if (message.content === "!clear") {
		deleteMessages(message.channel);
	}
});

server.get("/send/:channel/:message", (req, res) => {
	const channel: TextChannel = bot.channels.get(req.params.channel) as TextChannel;

	if (!channel) {
		res.status(400).json({
			success: false,
			body: {
				message: "Invalid channel ID specified"
			}
		});
	}

	if (!(channel instanceof TextChannel)) {
		res.status(400).json({
			success: false,
			body: {
				message: "The channel specified was not a text channel"
			}
		});
	}

	channel.send(req.params.message);

	res.status(200).json({
		success: true,
		body: {
			message: "Message sent"
		}
	});
});

// Webhook receiver
server.post("/webhook", (req, res) => {
	console.log(req.body);

	res.status(200).json({
		success: true
	});
});

server.listen(8080, () => console.log("Server listening on port 8080"));
bot.login(keys.BOT_TOKEN);
