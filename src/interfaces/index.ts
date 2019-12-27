export interface IAuthState {
	repoUrl: string;
	guildId: string;
	channelId: string;
}

export interface ICommitObject {
	id: string;
	message: string;
	timestamp: string;
	url: string;
	distinct: boolean;
	author: {
		name: string;
		email: string;
		username: string;
	};
}

export interface IPullRequestObject {
	title: string;
	html_url: string;
	user: {
		login: string;
	};
	head: {
		ref: string;
	};
	base: {
		ref: string;
	};
}

// DATABASE SCHEMA INTERFACES
export interface IGuildSchema {
	GuildID: string;
	DateAdded: string;
}

export interface IWebhookSchema {
	WebhookID: number;
	GuildID: string;
	ChannelID: string;
	RepoURL: string;
	Secret: string;
}
