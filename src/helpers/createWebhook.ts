import request from "request";
import { insertWebhook } from "../database/webhook";
import keys from "../config/keys";

export default (repoUrl: string, accessToken: string, secret: string): Promise<number> => {
	return new Promise((resolve, reject) => {
		const splitRepoUrl = repoUrl.split("/");
		const userRepoSection = splitRepoUrl[3] + "/" + splitRepoUrl[4];
		const uri = "https://api.github.com/repos/" + userRepoSection + "/hooks";

		// Send the post request to Github's API with the user's access token to create the new
		// webhook in the user's repository.
		request(
			{
				uri,
				method: "POST",
				body: JSON.stringify({
					name: "web",
					active: true,
					events: ["push", "pull_request"],
					config: {
						url: `http://${keys.GITHUB_CALLBACK_HOST}:${keys.SERVER_PORT}/webhook`,
						content_type: "json",
						secret,
						insecure_ssl: 1
					}
				}),
				headers: {
					"User-Agent": "GitBot",
					Authorization: "Bearer " + accessToken
				}
			},
			(err, res, b) => {
				resolve(res.statusCode);
			}
		);
	});
};
