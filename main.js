const Discord = require('discord.js');
const bot = require('./bot');
const server = require('./server');
const { BOT_TOKEN } = require('./config/keys.js');

bot.on('message', (message) => {
    if (message.content === 'embed test') {
        const embed = new Discord.RichEmbed();
        embed.setTitle('Embed test');
        embed.setColor('0xFF0000');
        embed.setDescription('Hey! This is an embed.');

        message.channel.send(embed);
    } else if (message.content === '!channels') {
        let availableChannels =
            "Here's the list of channels I have access to: \n\n";

        bot.channels.forEach((channel) => {
            availableChannels += channel.id + '\n';
        });

        const embed = new Discord.RichEmbed();
        embed.setTitle('Embed test');
        embed.setColor('0xFF0000');
        embed.setDescription(availableChannels);

        message.channel.send(embed);
    } else if (message.content === '!clear') {
        require('./botactions/deleteMessages')(message.channel);
    }
});

server.get('/send/:channel/:message', (req, res) => {
    const channel = bot.channels.get(req.params.channel);

    if (!channel) {
        res.status(400).json({
            success: false,
            body: {
                message: 'Invalid channel ID specified'
            }
        });
    }

    channel.send(req.params.message);

    res.status(200).json({
        success: true,
        body: {
            message: 'Message sent'
        }
    });
});

// Webhook receiver
server.post('/webhook', (req, res) => {
    console.log(req.body);

    res.status(200).json({
        success: true
    });
});

server.listen(8080, () => console.log('Server listening on port 8080'));
bot.login(BOT_TOKEN);
