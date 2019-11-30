import deleteMessages from "../actions/deleteMessages";
import { TextChannel, DMChannel } from "discord.js";

export default (channel: TextChannel) => {
	// We don't want to handle this command unless it was used within a server.
	if (channel.guild == null) return;

	deleteMessages(channel, 100);
};
