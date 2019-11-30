const urlRegex = new RegExp("https://github.com/([a-zA-z-]*)/([a-zA-Z-]*)");

export default (encodedUrl: string) => {
	if (!encodedUrl) return false;

	const repoUrl = Buffer.from(encodedUrl, "base64").toString("ascii");

	return urlRegex.test(repoUrl);
};
