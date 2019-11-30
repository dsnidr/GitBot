import request from "request";

export default (repoUrl: string, accessToken: string, secret: string) => {
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
				if (err) {
					return resolve(`
					<html>
						<body>
							<h1>Something went wrong</h1>
						</body>
					</html>`);
				}

				if (res.statusCode === 404) {
					return resolve(`
					<html>
						<body>
							<h1>That repo could not be found</h1>
						</body>
					</html>`);
				}

				const body = JSON.parse(b);

				return resolve(`
					<html>
						<body>
							<h1>Webhook created</h1>
						</body>
					</html>`);
			}
		);
	});
};
