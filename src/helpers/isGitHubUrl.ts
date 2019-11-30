const urlRegex = new RegExp("https://github.com/([a-zA-z-]*)/([a-zA-Z-]*)");

export default (url: string) => {
	return urlRegex.test(url);
};
