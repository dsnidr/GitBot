import { TextChannel, Message } from "discord.js";
import bot from "./bot";
import server from "./server";
import keys from "./config/keys";

import handleCommand from "./bot/commands";

bot.on("message", (message: Message) => {
	let messageString: string = message.content;

	// Check if the message received is a command
	if (messageString.length < 2 || messageString.charAt(0) != "!") return;

	// Strip the ! from the command string
	messageString = messageString.substring(1, messageString.length);

	const messageSplit = messageString.split(" ");

	const cmdString: string = messageSplit[0];
	const cmdArgs: string[] = [];

	// Add the arguments to the cmdArgs array
	if (messageSplit.length > 1) {
		messageSplit.forEach(arg => cmdArgs.push(arg));
	}

	// Run the command
	handleCommand(cmdString, cmdArgs, message);
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
