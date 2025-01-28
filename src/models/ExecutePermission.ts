import { ChatInputCommandInteraction, GuildMember } from "discord.js";

export const And = async (
    ...userPermissions: Promise<boolean>[]
): Promise<boolean> => {
    const permissions = await Promise.all(userPermissions);

    return permissions.every(permission => permission);
};

export const Or = async (
    ...userPermissions: Promise<boolean>[]
): Promise<boolean> => {
    const permissions = await Promise.all(userPermissions);

    return permissions.some(permission => permission);
};

export const AuthorOf = (interaction: ChatInputCommandInteraction) => {
    return new UserPermission(interaction);
};

class UserPermission {
    constructor(
        private interaction: ChatInputCommandInteraction
    ) {}

    async is(id: string): Promise<boolean>;
    async is(id: string[]): Promise<boolean>;
    async is(idPredicate: string | string[]): Promise<boolean> {
        if (typeof idPredicate === "string") {
            return this.interaction.user.id === idPredicate;
        }

        if (Array.isArray(idPredicate)) {
            return idPredicate.includes(this.interaction.user.id);
        }

        return false;
    }

    async isnt(id: string): Promise<boolean>;
    async isnt(id: string[]): Promise<boolean>;
    async isnt(idPredicate: string | string[]): Promise<boolean> {
        if (typeof idPredicate === "string") {
            return this.interaction.user.id !== idPredicate;
        }

        if (Array.isArray(idPredicate)) {
            return !idPredicate.includes(this.interaction.user.id);
        }

        return false;
    }

    async has(permissionBit: BigInt): Promise<boolean>;
    async has(roleName: string): Promise<boolean>;
    async has(
        predicate: BigInt | string[] | string
    ): Promise<boolean> {
        const { guild, user } = this.interaction;

        if (guild === null) {
            return false;
        }

        const member = await guild.members.fetch(user.id);

        if (member === null) {
            return false;
        }

        if (typeof predicate === "string") {
            return UserPermission.hasRole(member, predicate);
        }

        if (typeof predicate === "bigint") {
            return member.permissions.has(predicate);
        }

        return false;
    }

    async doesntHave(permissionBit: BigInt): Promise<boolean>;
    async doesntHave(roleName: string): Promise<boolean>;
    async doesntHave(
        predicate: BigInt | string[] | string
    ): Promise<boolean> {
        const { guild, user } = this.interaction;

        if (guild === null) {
            return false;
        }

        const member = await guild.members.fetch(user.id);

        if (member === null) {
            return false;
        }

        if (typeof predicate === "string") {
            return !UserPermission.hasRole(member, predicate);
        }

        if (typeof predicate === "bigint") {
            return !member.permissions.has(predicate);
        }

        return false;
    }

    private static hasRole = (
        member: GuildMember,
        targetRole: string
    ): boolean => {
        return member.roles.cache.some(role => {
            return role.name.toLowerCase().trim()
                === targetRole.toLowerCase().trim();
        });
    };
}
