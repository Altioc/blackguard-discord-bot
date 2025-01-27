import { Collection } from "discord.js";
import { BotCommand } from "../types/BotCommand";

export const buttons = new Collection<string, any>();
export const modals = new Collection<string, any>();
export const commands = new Collection<string, BotCommand>();
