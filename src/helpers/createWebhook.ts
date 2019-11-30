import request from "request";
import { insertWebhook } from "../database/webhook";

export default (repoUrl: string, accessToken: string, secret: string): Promise<number> => {
	return new Promise((resolve, reject) => {
		const splitRepoUrl = repoUrl.split("/");
		const userRepoSection = splitRepoUrl[3] + "/" + splitRepoUrl[4];
		const uri = "https://api.github.com/repos/" + userRepoSection + "/hooks";

		request(
			{
				uri,
				method: "POST",
				body: JSON.stringify({
					name: "web",
					active: true,
					events: ["push", "pull_request"],
					config: {
						url: "http://192.0.131.50:8080/webhook",
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
