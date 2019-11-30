export interface IAuthState {
	repoUrl: string;
	guildId: string;
	channelId: string;
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
