"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importStar(require("discord.js"));
const bot_1 = __importDefault(require("./bot"));
const server_1 = __importDefault(require("./server"));
const keys_1 = __importDefault(require("./config/keys"));
const deleteMessages_1 = __importDefault(require("./bot/actions/deleteMessages"));
bot_1.default.on("message", (message) => {
    if (message.content === "embed test") {
        const embed = new discord_js_1.default.RichEmbed();
        embed.setTitle("Embed test");
        embed.setColor("0xFF0000");
        embed.setDescription("Hey! This is an embed.");
        message.channel.send(embed);
    }
    else if (message.content === "!channels") {
        let availableChannels = "Here's the list of channels I have access to: \n\n";
        bot_1.default.channels.forEach((channel) => {
            availableChannels += channel.id + "\n";
        });
        const embed = new discord_js_1.RichEmbed();
        embed.setTitle("Embed test");
        embed.setColor("0xFF0000");
        embed.setDescription(availableChannels);
        message.channel.send(embed);
    }
    else if (message.content === "!clear") {
        deleteMessages_1.default(message.channel);
    }
});
server_1.default.get("/send/:channel/:message", (req, res) => {
    const channel = bot_1.default.channels.get(req.params.channel);
    if (!channel) {
        res.status(400).json({
            success: false,
            body: {
                message: "Invalid channel ID specified"
            }
        });
    }
    if (!(channel instanceof discord_js_1.TextChannel)) {
        res.status(400).json({
            success: false,
            body: {
                message: "The channel specified was not a text channel"
            }
        });
    }
    channel.send(req.params.message);
    res.status(200).json({
        success: true,
        body: {
            message: "Message sent"
        }
    });
});
// Webhook receiver
server_1.default.post("/webhook", (req, res) => {
    console.log(req.body);
    res.status(200).json({
        success: true
    });
});
server_1.default.listen(8080, () => console.log("Server listening on port 8080"));
bot_1.default.login(keys_1.default.BOT_TOKEN);
//# sourceMappingURL=main.js.map