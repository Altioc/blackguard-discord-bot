import { Client, Events } from "discord.js";
import assert from "node:assert";
import { Meta } from "../controllers/Meta";

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        assert(client.user !== null);

        Meta.setBotId(client.user.id);
        console.log(`Ready! Logged in as ${client.user.tag}`);
    }
};
