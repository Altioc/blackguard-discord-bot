import { Client, Events } from "discord.js";
import assert from "node:assert";
import { Meta } from "../controllers/Meta";

export const readyEventHandler = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        assert(client.user !== null);

        await Meta.setClient(client);

        console.log(`Ready! Logged in as ${client.user.tag}`);
    }
};

export default readyEventHandler;
