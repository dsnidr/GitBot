import request from "request";
import crypto from "crypto";
import { Message } from "discord.js";
import bot from "./bot";
import server from "./server";
import keys from "./config/keys";
import isGitHubUrl from "./helpers/isGitHubUrl";
import createWebhook from "./helpers/createWebhook";
import handleCommand from "./bot/commands";
import { insertWebhook, getWebhookByUrl } from "./database/webhook";
import { IAuthState } from "./interfaces";

// TODO: Logging

bot.on("message", async (message: Message) => {
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

server.listen(keys.SERVER_PORT, () => console.log("Server listening on port 8080"));
bot.login(keys.BOT_TOKEN);
