import pool from "./connectionPool";
import keys from "../config/keys";
import { IWebhookSchema } from "../interfaces";

// TODO: Logging

export const insertWebhook = async (guildId: string, channelId: string, repoUrl: string, secret: string) => {
	const query = `INSERT INTO \`${keys.MYSQL.DATABASE}\`.\`Webhook\` VALUES (NULL, ?, ?, ?, ?);`;

	const [rows] = await pool.execute(query, [guildId, channelId, repoUrl, secret]);
};

export const deleteWebhook = (webhookId: number) => {
	// Placeholder
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
