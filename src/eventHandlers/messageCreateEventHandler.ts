import { Events, GatewayMessageCreateDispatchData } from "discord.js";

export const messageCreateEventHandler = {
    name: Events.MessageCreate,
    async execute(interaction: GatewayMessageCreateDispatchData) {
        const { mentions } = interaction;
    }
};

export default messageCreateEventHandler;
