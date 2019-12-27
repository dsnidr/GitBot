import { Router } from "express";
import { getWebhookByUrl } from "../../database/webhook";
import crypto from "crypto";
import bot from "../../bot";
import { TextChannel, RichEmbed } from "discord.js";
import { ICommitObject, IPullRequestObject } from "../../interfaces";

const router = Router();

router.post("/", async (req, res) => {
	const body = req.body;

	// If no payload was provided, drop the request.
	if (!body) {
		return;
	}

	// Make sure that a repo url was provided. If it wasn't, silently drop the request
	if (!body.repository || !body.repository.html_url) {
		return;
	}

	// Get the webhook data from the database
	const webhook = await getWebhookByUrl(body.repository.html_url);

	// If the webhook doesn't exist, this is an invalid request so we drop it.
	if (!webhook) {
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

	// Determine whether or not the hashes match in a time safe manner to prevent timing attacks
	const hashesMatch = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(githubHash));

	// If the wrong hash was provided, silently drop the request.
	if (!hashesMatch) {
		return;
	}

	// Since we only allow subscriptions to TextChannels, we can be sure that this is a text channel.
	const channel: TextChannel = bot.channels.get(webhook.ChannelID) as TextChannel;

	// Handle opening of a pull request
	if (body.pull_request && body.action === "opened") {
		const data = body.pull_request as IPullRequestObject;

		const base = data.base.ref;
		const head = data.head.ref;

		const embed = new RichEmbed();
		embed.setTitle(`:twisted_rightwards_arrows: New pull request from ${data.user.login}`);
		embed.setDescription(`${base} :arrow_left: ${head}\n\n${data.title}\n\n${data.html_url}`);
		embed.setColor("#00ff00");

		await channel.send(embed);
	}

	// Handle closing of a pull request
	else if (body.pull_request && body.action === "closed") {
		const data = body.pull_request as IPullRequestObject;

		const embed = new RichEmbed();
		embed.setTitle(`:x: ${data.user.login} closed pull request ${body.number}`);
		embed.setDescription(`${data.html_url}`);
		embed.setColor("#ff0000");

		await channel.send(embed);
	}

	// Handle reopening of a pull request
	else if (body.pull_request && body.action === "reopened") {
		const data = body.pull_request as IPullRequestObject;

		const base = data.base.ref;
		const head = data.head.ref;

		const embed = new RichEmbed();
		embed.setTitle(`:twisted_rightwards_arrows: ${data.user.login} reopened pull request ${body.number}`);
		embed.setDescription(`${base} :arrow_left: ${head}\n\n${data.title}\n\n${data.html_url}`);
		embed.setColor("#00ff00");

		await channel.send(embed);
	}

	// Handle closing of a push request
	else if (body.commits && body.commits.length > 0) {
		// Get branch that the push payload references
		const refSplit: string[] = (body.ref as string).split("/");
		const branch = refSplit[refSplit.length - 1];

		// Get commits from payload
		const commits: ICommitObject[] = body.commits as ICommitObject[];

		// Send a message for each new commit
		commits.forEach(async (commit: ICommitObject) => {
			// We check the distinct property of each object to determine whether or not this is a
			// new push, or a push event caused by a pull-request related event. If it's due to a
			// pull request, we don't want to send anything to avoid spamming.
			if (!commit.distinct) {
				return;
			}

			const embed = new RichEmbed();
			embed.setTitle(`New commit from ${commit.author.username}`);
			embed.setDescription(commit.message);
			embed.setFooter(branch);
			embed.setColor("#00ffff");

			await channel.send(embed);
		});
	}

	return res.status(200).json({
		success: true
	});
});

export default router;
