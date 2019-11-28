import Discord, { TextChannel } from "discord.js";

export default async (channel: TextChannel, amount: number) => {
	if (!channel) return;

	const messages = await channel.fetchMessages({ limit: amount });

	messages.forEach(msg => {
		msg.delete();
	});
};
