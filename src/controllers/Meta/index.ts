import PouchDB from "pouchdb";
import PouchDBUpsert from "pouchdb-upsert";
PouchDB.plugin(PouchDBUpsert);

import {
    ChannelType,
    Client,
    Guild,
    Interaction,
    TextChannel
} from "discord.js";
import assert from "node:assert";
import { BlackguardDbDocName, initialMetaDoc, LogLevel } from "../../constants";
import { IntroductionAutomator } from "../../controllers/Meta/IntroductionAutomator";
import { MetaDocument } from "../../types/MetaDocument";

class MetaController {
    client!: Client;
    guild!: Guild;
    botId!: string;
    introductionAutomator!: IntroductionAutomator;
    memberRoles = new Set<string>();
    rejectedRole: string | null = null;
    logLevel = LogLevel.Off;
    loggingChannelId: string | null = null;
    loggingChannel: TextChannel | null = null;
    db: PouchDB.Database;
    previousBaer?: string;

    constructor() {
        this.db = new PouchDB("BlackguardBotDb");
        this.db.putIfNotExists(initialMetaDoc)
            .then(() => this.loadGuildDoc());
    }

    async setClient(client: Client): Promise<void> {
        assert(client.user !== null);

        this.botId = client.user.id;
        this.client = client;

        const oauthGuilds = await this.client.guilds.fetch();
        const mainOauthGuild = oauthGuilds.at(0);

        assert(mainOauthGuild !== undefined);

        this.guild = await mainOauthGuild.fetch();

        if (this.loggingChannelId !== null) {
            const loggingChannel = await this.guild.channels.fetch(
                this.loggingChannelId
            );

            assert(loggingChannel !== null);
            assert(loggingChannel.type === ChannelType.GuildText);

            this.loggingChannel = loggingChannel;
        }
    }

    async logInfo(
        interaction: Interaction,
        ...messages: string[]
    ): Promise<void>;
    async logInfo(
        ...messages: string[]
    ): Promise<void>;
    async logInfo(
        message: Interaction | string,
        ...messages: string[]
    ): Promise<void> {
        this.log(LogLevel.Info, message, ...messages);
    }

    async logDebug(
        interaction: Interaction,
        ...messages: string[]
    ): Promise<void>;
    async logDebug(
        ...messages: string[]
    ): Promise<void>;
    async logDebug(
        message: string | Interaction,
        ...messages: string[]
    ): Promise<void> {
        this.log(LogLevel.Debug, message, ...messages);
    }

    async logError(
        interaction: Interaction,
        ...messages: string[]
    ): Promise<void>;
    async logError(
        ...messages: string[]
    ): Promise<void>;
    async logError(
        message: Interaction | string,
        ...messages: string[]
    ): Promise<void> {
        this.log(LogLevel.Error, message, ...messages);
    }

    async setLogLevel(newLogLevel: LogLevel): Promise<void> {
        this.logLevel = newLogLevel;
        await this.db.upsert(
            BlackguardDbDocName.Meta,
            (doc) => {
                return {
                    ...doc,
                    logLevel: this.logLevel
                };
            }
        );
    }

    async removeLoggingChannel(): Promise<void> {
        this.loggingChannel = null;
        await this.db.upsert(
            BlackguardDbDocName.Meta,
            (doc) => {
                return {
                    ...doc,
                    loggingChannelId: null
                };
            }
        );
    }

    async setLoggingChannel(channel: TextChannel): Promise<void> {
        this.loggingChannel = channel;
        await this.db.upsert(
            BlackguardDbDocName.Meta,
            (doc) => {
                return {
                    ...doc,
                    loggingChannelId: channel.id
                };
            }
        );
    }

    async setRejectedRole(roleId: string | null): Promise<void> {
        this.rejectedRole = roleId;
        await this.db.upsert(
            BlackguardDbDocName.Meta,
            (doc) => {
                return {
                    ...doc,
                    rejectedRole: this.rejectedRole
                };
            }
        );
    }

    async addMemberRole(roleId: string): Promise<void> {
        this.memberRoles.add(roleId);
        await this.updateMemberRoles();
    }

    async removeMemberRole(roleId: string): Promise<void> {
        this.memberRoles.delete(roleId);
        await this.updateMemberRoles();
    }

    async updateMemberRoles(): Promise<void> {
        await this.db.upsert(
            BlackguardDbDocName.Meta,
            (doc) => {
                return {
                    ...doc,
                    memberRoles: Array.from(this.memberRoles)
                };
            }
        );
    }

    async resetDoc(): Promise<void> {
        await this.db.upsert(
            BlackguardDbDocName.Meta,
            () => initialMetaDoc
        );
    }

    async loadGuildDoc(): Promise<void> {
        const doc = await this.db.get<MetaDocument>(BlackguardDbDocName.Meta);

        this.rejectedRole = doc.rejectedRole;

        this.memberRoles = new Set(doc.memberRoles);

        this.logLevel = doc.logLevel;
        this.loggingChannelId = doc.loggingChannelId || null;

        this.introductionAutomator = new IntroductionAutomator(
            this.db,
            doc.introductionAutomator
        );
    }

    private async log(
        level: Exclude<LogLevel, "Off">,
        message: string | Interaction,
        ...messages: string[]
    ): Promise<void> {
        if (this.loggingChannel === null) {
            return;
        }

        if (level < this.logLevel) {
            return;
        }

        if (typeof message === "string") {
            await this.loggingChannel.send(
                `[${level}]: ${message}\n${JSON.stringify(messages)}`
            );
            return;
        }

        const debugInfo = this.extractLogInfoFromInteraction(message);

        await this.loggingChannel.send(
            `[${level}]: ${debugInfo}\n${JSON.stringify(messages)}`
        );
    }

    private extractLogInfoFromInteraction(
        interaction: Interaction
    ): string {
        const info = {
            id: interaction.id,
            channelId: interaction.channelId,
            timestamp: interaction.createdTimestamp,
            userId: interaction.user.id,
            type: interaction.type
        };

        return `\`\`\`json\n${JSON.stringify(info, null, "\t")}\`\`\``;
    }
}

export const Meta = new MetaController();
