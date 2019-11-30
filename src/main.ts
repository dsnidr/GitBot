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

// Webhook receiver
server.post("/webhook", async (req, res) => {
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

	res.status(200).json({
		success: true
	});
});

server.get("/auth/github", (req, res) => {
	const encodedState: string = req.query.state;
	const decodedState = Buffer.from(encodedState, "base64").toString("ascii");

	let state: IAuthState = undefined;

	try {
		state = JSON.parse(decodedState) as IAuthState;
	} catch (e) {
		return res.send(`
		<!DOCTYTPE html>
		<html>
			<body>
				<h1>Something went wrong</h1>
				<p>If you're here by mistake, you may close this tab.</p>
				<p>If you didn't expect this error, please reclick the link sent to you by GitBot</p>
			</body>
		</html>`);
	}

	// TODO: check if webhook already exists
	// TODO: make sure that guildId and channelId are valid IDs

	// Ensure that a repo parameter exists on the query string
	if (!isGitHubUrl(state.repoUrl)) {
		return res.send(`
		<!DOCTYTPE html>
		<html>
			<body>
				<h1>Something went wrong</h1>
				<p>If you're here by mistake, you may close this tab.</p>
				<p>If you didn't expect this error, please reclick the link sent to you by GitBot</p>
			</body>
		</html>`);
	}

	res.redirect(
		`https://github.com/login/oauth/authorize?scope=user:email,repo&client_id=${keys.GITHUB_CLIENT_ID}&state=${encodedState}`
	);
});

server.get("/auth/github/callback", (req, res) => {
	// TODO: Move the below code into a validation function to avoid duplicate code

	const encodedState = req.query.state;

	const decodedState = Buffer.from(encodedState, "base64").toString("ascii");

	let state: IAuthState = undefined;

	try {
		state = JSON.parse(decodedState) as IAuthState;
	} catch (e) {
		return res.send(`
		<!DOCTYTPE html>
		<html>
			<body>
				<h1>Something went wrong</h1>
				<p>If you're here by mistake, you may close this tab.</p>
				<p>If you didn't expect this error, please reclick the link sent to you by GitBot</p>
			</body>
		</html>`);
	}

	if (!isGitHubUrl(state.repoUrl)) {
		return res.send(`
		<!DOCTYTPE html>
		<html>
			<body>
				<h1>Something went wrong</h1>
				<p>If you're here by mistake, you may close this tab.</p>
				<p>If you didn't expect this error, please reclick the link sent to you by GitBot</p>
			</body>
		</html>`);
	}

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
		async (err, r, b) => {
			const body = JSON.parse(b);

			// Generate a pseudo random secret key for the webhook
			const secret = crypto.randomBytes(20).toString("hex");

			// Store this new webhook in the database
			const statusCode = await createWebhook(state.repoUrl, body.access_token, secret);

			// TODO: Create actual templates so we don't need to use these ugly html literal strings

			// 404 = Not Found
			if (statusCode === 404) {
				return res.send(`
				<html>
					<body>
						<h1>That repository could not be found</h1>
					</body>
				</html>`);
			}

			// 201 = Created
			else if (statusCode !== 201) {
				return res.send(`
				<html>
					<body>
						<h1>Something went wrong</h1>
						<p>We were unable to create a webhook to that repository. Please try again later</p>
					</body>
				</html>`);
			}

			// Otherwise, everything was successful
			else {
				insertWebhook(state.guildId, state.channelId, state.repoUrl, secret)
					.then(() => {
						return res.send(`
								<html>
									<body>
										<h1>Webhook Created</h1>
									</body>
								</html>`);
					})
					.catch(err => {
						// TODO: Send a delete request to remove the webhook we just created.

						console.log(err);
						return res.send(`
					<html>
						<body>
							<h1>Something went wrong</h1>
							<p>We tried and tried but we couldn't create your webhook. Please try again later</p>
						</body>
					</html>`);
					});
			}
		}
	);
});

server.listen(8080, () => console.log("Server listening on port 8080"));
bot.login(keys.BOT_TOKEN);
