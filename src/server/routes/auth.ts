import { Router } from "express";
import request from "request";
import { IAuthState } from "../../interfaces";
import isGitHubUrl from "../../helpers/isGitHubUrl";
import createWebhook from "../../helpers/createWebhook";
import keys from "../../config/keys";
import crypto from "crypto";
import { insertWebhook } from "../../database/webhook";

const router = Router();

router.get("/github", (req, res) => {
	const encodedState: string = req.query.state;
	const decodedState = Buffer.from(encodedState, "base64").toString("ascii");

	let state: IAuthState = undefined;

	try {
		state = JSON.parse(decodedState) as IAuthState;
	} catch (e) {
		return res.render("auth", {
			header: "Something went wrong",
			messages: [
				"We were unable to properly process your request.",
				"If you believe this is a mistake, please retry."
			]
		});
	}

	// TODO: check if webhook already exists
	// TODO: make sure that guildId and channelId are valid IDs

	// Ensure that a repo parameter exists on the query string
	if (!isGitHubUrl(state.repoUrl)) {
		return res.render("auth", {
			header: "Something went wrong",
			messages: [
				"We were unable to properly process your request.",
				"If you believe this is a mistake, please retry."
			]
		});
	}

	res.redirect(
		`https://github.com/login/oauth/authorize?scope=user:email,repo&client_id=${keys.GITHUB_CLIENT_ID}&state=${encodedState}`
	);
});

router.get("/github/callback", (req, res) => {
	// TODO: Move the below code into a validation function to avoid duplicate code

	const encodedState = req.query.state;

	const decodedState = Buffer.from(encodedState, "base64").toString("ascii");

	let state: IAuthState = undefined;

	try {
		state = JSON.parse(decodedState) as IAuthState;
	} catch (e) {
		return res.render("auth", {
			header: "Something went wrong",
			messages: [
				"We were unable to properly process your request.",
				"If you believe this is a mistake, please retry."
			]
		});
	}

	if (!isGitHubUrl(state.repoUrl)) {
		return res.render("auth", {
			header: "Something went wrong",
			messages: [
				"We were unable to properly process your request.",
				"If you believe this is a mistake, please retry."
			]
		});
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
				return res.render("auth", {
					header: "That repository does not exist",
					messages: [
						"Please make sure that you entered the right URL. It should look something like https://github.com/sniddunc/GitBot",
						"If you are sure you got the URL right, double check that you are able to administrate that repository's settings."
					]
				});
			}

			// 201 = Created
			else if (statusCode !== 201) {
				return res.render("auth", {
					header: "Something went wrong",
					messages: [
						"We are unable to create the necessary webhook for this repository. Please try again later."
					]
				});
			}

			// Otherwise, everything was successful
			else {
				insertWebhook(state.guildId, state.channelId, state.repoUrl, secret)
					.then(() => {
						return res.render("auth", {
							header: "Success!",
							messages: [
								"We were able to create the necessary webhook, and the channel you specified is now subscribed to the specified repo."
							]
						});
					})
					.catch(err => {
						// TODO: Send a delete request to remove the webhook we just created.

						console.log(err);

						return res.render("auth", {
							header: "Something went wrong",
							messages: [
								"We are unable to create the necessary webhook for this repository. Please try again later."
							]
						});
					});
			}
		}
	);
});

export default router;
