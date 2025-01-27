import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "node:fs";
import { clientId, guildId, token } from "./config.json";
import { BotCommand } from "./types/BotCommand";

const commands: BotCommand[] = [];
const commandDirectories = fs.readdirSync(`${__dirname}/commands/`);

commandDirectories.forEach((file) => {
    const fileStat = fs.statSync(`${__dirname}/commands/${file}`);

    if (fileStat?.isDirectory()) {
        const commandFiles = fs.readdirSync(`${__dirname}/commands/${file}`);

        if (commandFiles?.includes("index.js")) {
            const command = require(`${__dirname}/commands/${file}/index.js`);
            commands.push(command.data.toJSON());
        }
    }
});

const rest = new REST({ version: "9" }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => {
        console.log("Successfully registered application commands.");
        process.exit(0);
    })
    .catch(console.error);
