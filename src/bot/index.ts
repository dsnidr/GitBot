import Discord, { Guild, Channel } from "discord.js";
import { insertGuild, deleteGuild } from "../database/guild";
import { deleteWebhook, deleteWebhookByGuildId, deleteWebhookByChannelId } from "../database/webhook";

const client = new Discord.Client();

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("guildCreate", (guild: Guild) => {
	// Make sure guild is recorded in the database
	insertGuild(guild.id);
});

client.on("guildDelete", (guild: Guild) => {
	// Remove guild from the database and all webhooks associated with it
	deleteWebhookByGuildId(guild.id);
	deleteGuild(guild.id);
});

client.on("channelDelete", (channel: Channel) => {
	// Remove all webhooks associated with the deleted channel
	deleteWebhookByChannelId(channel.id);
});

export default client;
