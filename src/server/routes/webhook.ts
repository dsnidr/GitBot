import { Router } from "express";
import { getWebhookByUrl } from "../../database/webhook";
import crypto from "crypto";
import bot from "../../bot";
import { TextChannel, RichEmbed } from "discord.js";
import { brotliCompress } from "zlib";
import { booleanLiteral } from "@babel/types";

const router = Router();

router.post("/", async (req, res) => {
	const body = req.body;

	// Get the webhook data from the database
	const webhook = await getWebhookByUrl(body.repository.html_url);

	// If the webhook doesn't exist, this is an invalid request so we drop it.
	if (!webhook) {
		return;
	}

	// If no payload was provided, drop the request.
	if (!body) {
		return;
	}

	// Grab the GitHub generated hash from our headers.
	const githubHash: string = req.headers["x-hub-signature"] as string;

	// Ensure that the hash is the right length. We check 45 since they
	// prefix their hashes with sha1=, so we need to acount for that.
	if (githubHash.length != 40 + 5) {
		return;
	}

	// Generate our own hash to compare to the one provided by GitHub
	let hash = crypto
		.createHmac("sha1", webhook.Secret)
		.update(JSON.stringify(body))
		.digest("hex");
	hash = "sha1=" + hash;

	const hashesMatch = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(githubHash));

	// If an invalid hash was provided, drop the request.
	if (!hashesMatch) {
		return;
	}

	// Since we only allow subscriptions to TextChannels, we can be sure that this is a text channel.
	const channel: TextChannel = bot.channels.get(webhook.ChannelID) as TextChannel;

	// TODO: Determine the proper message and color to send from the webhook data

	const embed = new RichEmbed();
	embed.setTitle("Received data");
	embed.setDescription("Repo: " + webhook.RepoURL);
	embed.setColor("#00ffff");

	channel.send(embed);

	return res.status(200).json({
		success: true
	});
});

export default router;
