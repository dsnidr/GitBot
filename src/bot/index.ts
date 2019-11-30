import Discord, { Guild, Channel } from "discord.js";
import { insertGuild, deleteGuild } from "../database/guild";

const client = new Discord.Client();

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("guildCreate", (guild: Guild) => {
	// Make sure guild is recorded in the database
	insertGuild(guild.id);
});

client.on("guildDelete", (guild: Guild) => {
	// Remove guild from the database
	deleteGuild(guild.id);
});

client.on("channelDelete", (channel: Channel) => {
	// TODO: Ensure that any subscriptions for this channel are deleted. (i.e webhooks, database rows, etc)
});

export default client;
