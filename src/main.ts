import request from "request";
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
		messageSplit.forEach((arg, index) => {
			if (index === 0) return;

			cmdArgs.push(arg);
		});
	}

	// Run the command
	handleCommand(cmdString, cmdArgs, message);
});

// Webhook receiver
server.post("/webhook", (req, res) => {
	console.log(req.body);

	res.status(200).json({
		success: true
	});
});

server.get("/auth/github", (req, res) => {
	res.redirect(
		`https://github.com/login/oauth/authorize?scope=user:email,repo&client_id=${keys.GITHUB_CLIENT_ID}`
	);
});

server.get("/auth/github/callback", (req, res) => {
	request(
		{
			uri: "https://github.com/login/oauth/access_token",
			method: "POST",
			form: {
				client_id: keys.GITHUB_CLIENT_ID,
				client_secret: keys.GITHUB_CLIENT_SECRET,
				code: req.query.code
			},
			headers: {
				accept: "application/json"
			}
		},
		(err, r, b) => {
			const body = JSON.parse(b);

			// TODO: Store access token somehow

			res.redirect("discord://");
		}
	);
});

server.listen(8080, () => console.log("Server listening on port 8080"));
bot.login(keys.BOT_TOKEN);
