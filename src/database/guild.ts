import pool from "./connectionPool";
import keys from "../config/keys";
import { RowDataPacket } from "mysql";
import { IGuildSchema } from "../interfaces";

// TODO: Logging

export const insertGuild = async (guildId: string) => {
	const query = `INSERT INTO \`${keys.MYSQL.DATABASE}\`.\`Guild\` VALUES (?, NULL);`;

	const [rows] = await pool.execute(query, [guildId]);
};

export const deleteGuild = async (guildId: string) => {
	const query = `DELETE FROM \`${keys.MYSQL.DATABASE}\`.\`Guild\` WHERE \`Guild\`.\`GuildID\` = ?;`;

	const [rows] = await pool.execute(query, [guildId]);
};

export const getGuild = async (guildId: string): Promise<IGuildSchema> => {
	const query = `SELECT * FROM \`${keys.MYSQL.DATABASE}\`.\`Guild\` WHERE \`Guild\`.\`GuildID\` = ? LIMIT 1;`;

	const [rows] = await pool.execute(query, [guildId]);

	const row = rows[0];

	if (!row) {
		return undefined;
	}

	const guild: IGuildSchema = row as IGuildSchema;

	return guild;
};
