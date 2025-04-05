import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "node:fs";
import { token } from "./config.json";
import { buttons, commands, modals } from "./constants/interactionHandlers";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const loadHandlers = (
    directoriesPath: string,
    collection: Collection<string, any>
) => {
    const directories = fs.readdirSync(directoriesPath);
    directories.forEach((directory) => {
        const path = `${directoriesPath}/${directory}`;
        const directoryStat = fs.statSync(path);

        if (directoryStat?.isDirectory()) {
            const files = fs.readdirSync(path);

            if (files?.includes("index.js")) {
                const handler = require(`${path}/index.js`).default;
                collection.set(handler.name, handler);
            }
        } else {
            if (!path.endsWith("js")) {
                return;
            }

            const handler = require(path).default;
            collection.set(handler.name, handler);
        }
    });
};

loadHandlers(`${__dirname}/commands`, commands);
loadHandlers(`${__dirname}/buttons`, buttons);
loadHandlers(`${__dirname}/modals`, modals);

const eventHandlersPath = `${__dirname}/eventHandlers`;
const javascriptFilesOnly = (file: string) => file.endsWith(".js");
const eventFiles = fs.readdirSync(eventHandlersPath).filter(
    javascriptFilesOnly
);

eventFiles.forEach((file) => {
    const filePath = `${eventHandlersPath}/${file}`;
    const eventHandler = require(filePath).default;

    if (eventHandler.once) {
        client.once(eventHandler.name, eventHandler.execute);
    } else {
        client.on(eventHandler.name, eventHandler.execute);
    }
});

client.login(token);
