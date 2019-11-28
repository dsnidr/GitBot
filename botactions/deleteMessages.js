const Discord = require('discord.js');

module.exports = async (channel) => {
    if (!channel) return;

    const messages = await channel.fetchMessages({ limit: 100 });

    messages.forEach((msg) => {
        msg.delete();
    });
};
