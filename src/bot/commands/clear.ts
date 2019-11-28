import deleteMessages from "../actions/deleteMessages";
import { TextChannel } from "discord.js";

export default (channel: TextChannel) => {
	deleteMessages(channel, 100);
};
