import Discord from "discord.js";

export default async channel => {
	if (!channel) return;

	const messages = await channel.fetchMessages({ limit: 100 });

	messages.forEach(msg => {
		msg.delete();
	});
};
