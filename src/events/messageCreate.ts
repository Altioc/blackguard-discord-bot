import { Events, GatewayMessageCreateDispatchData } from "discord.js";

export default {
    name: Events.MessageCreate,
    async execute(interaction: GatewayMessageCreateDispatchData) {
        const { mentions } = interaction;
    }
};
