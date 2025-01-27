import { ChatInputCommandInteraction } from "discord.js";
import { commands } from "../constants/interactionHandlers";

export const commandInteraction = {
    async execute(interaction: ChatInputCommandInteraction) {
        const { commandName } = interaction;
        const command = commands.get(commandName);

        if (!command || interaction.member === null) {
            return;
        }

        const requiredRoles = command.requiredRoles;
        const roles = interaction.member.roles instanceof Array
            ? interaction.member.roles
            : interaction.member.roles.cache;

        const canAccessCommands = requiredRoles.some((roleName) => (
            roles.some(role => {
                if (typeof role === "string") {
                    return role.toLowerCase().trim()
                        === roleName.toLowerCase().trim();
                }

                return role.name.toLowerCase().trim()
                    === roleName.toLowerCase().trim();
            })
        ));

        if (!canAccessCommands) {
            await interaction.reply({
                content: "You do not have permission to run this command.",
                ephemeral: true
            });
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.log(error, "command -> execute");
        }
    }
};
