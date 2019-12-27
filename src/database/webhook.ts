import pool from "./connectionPool";
import keys from "../config/keys";
import { IWebhookSchema } from "../interfaces";
import { RowDataPacket } from "mysql2";

// TODO: Logging

export const insertWebhook = async (guildId: string, channelId: string, repoUrl: string, secret: string) => {
	const query = `INSERT INTO \`${keys.MYSQL.DATABASE}\`.\`Webhook\` VALUES (NULL, ?, ?, ?, ?);`;

	const [rows] = await pool.execute(query, [guildId, channelId, repoUrl, secret]);
};

export const deleteWebhook = async (webhookId: string) => {
	const query = `DELETE FROM \`${keys.MYSQL.DATABASE}\`.\`Webhook\` WHERE \`Webhook\.\`WebhookID\` = ?;`;

	const [rows] = await pool.execute(query, [webhookId]);
};

export const deleteWebhookByGuildId = async (guildId: string) => {
	const query = `DELETE FROM \`${keys.MYSQL.DATABASE}\`.\`Webhook\` WHERE \`Webhook\.\`GuildID\` = ?;`;

	const [rows] = await pool.execute(query, [guildId]);
};

export const deleteWebhookByChannelId = async (channelId: string) => {
	const query = `DELETE FROM \`${keys.MYSQL.DATABASE}\`.\`Webhook\` WHERE \`Webhook\.\`ChannelID\` = ?;`;

	const [rows] = await pool.execute(query, [channelId]);
};

export const getWebhookByChannel = async (channelId: string): Promise<IWebhookSchema> => {
	const query = `SELECT * FROM \`${keys.MYSQL.DATABASE}\`.\`Webhook\` WHERE \`Webhook\`.\`ChannelID\` = ?;`;

	const [rows] = await pool.execute(query, [channelId]);

	const row = rows[0];

	if (!row) {
		return undefined;
	}

	const webhook: IWebhookSchema = row as IWebhookSchema;

	return webhook;
};

export const getWebhooksByGuild = async (guildId: string): Promise<IWebhookSchema[]> => {
	const query = `SELECT * FROM \`${keys.MYSQL.DATABASE}\`.\`Webhook\` WHERE \`Webhook\`.\`GuildID\` = ?;`;

	const [rows] = (await pool.execute(query, [guildId])) as RowDataPacket[];

	// Ensure the array isn't empty
	if (!rows || rows.length === 0) {
		return undefined;
	}

	// Create an empty array of webhook objects
	const webhooks: IWebhookSchema[] = [];

	await rows.array.forEach(row => {
		webhooks.push(row as IWebhookSchema);
	});

	return webhooks;
};

export const getWebhookByUrl = async (repoUrl: string): Promise<IWebhookSchema> => {
	const query = `SELECT * FROM \`${keys.MYSQL.DATABASE}\`.\`Webhook\` WHERE \`Webhook\`.\`RepoUrl\` = ?;`;

	const [rows] = await pool.execute(query, [repoUrl]);

	const row = rows[0];

	if (!row) {
		return undefined;
	}

	const webhook: IWebhookSchema = row as IWebhookSchema;

	return webhook;
};
