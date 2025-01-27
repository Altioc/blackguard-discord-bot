import PouchDB from "pouchdb";
import PouchDBUpsert from "pouchdb-upsert";
PouchDB.plugin(PouchDBUpsert);

import {
    BlackguardDbDocName,
    CurrencyLocation,
    EquipmentType,
    initialRPGDoc,
    responseCodes
} from "../constants";
import { Character } from "../models/Character";
import { Response } from "../types/Response";
import { RpgDocument } from "../types/RpgDocument";
import { RpgJuggingConfig } from "../types/RpgJuggingConfig";
import { RpgPlayerCooldown } from "../types/RpgPlayerCooldown";
import { random } from "../utils/random";
import { response } from "../utils/response";
import { Economy } from "./Economy";

class RpgController {
    jugging: RpgJuggingConfig & {
        playerCooldowns: Record<string, RpgPlayerCooldown>;
    } = {
        playerCooldowns: {},
        ...initialRPGDoc.config.jug // these should be moved out of the doc since they are constants can't be configured live due to message length
    };
    equipmentStats = initialRPGDoc.config.equipmentStats;
    characters: Record<string, Character> = {};
    db: PouchDB.Database;

    constructor() {
        this.db = new PouchDB("BlackguardBotDb");
        this.db.putIfNotExists(initialRPGDoc)
            .then(this.loadCharacters);
    }

    async resetDoc(): Promise<void> {
        await this.db.upsert(BlackguardDbDocName.Rpg, () => initialRPGDoc);
    }

    async loadCharacters(): Promise<void> {
        const doc = await this.db.get<RpgDocument>(BlackguardDbDocName.Rpg);

        Object.values(doc.characters).forEach((character) => {
            this.characters[character.ownerId] = new Character(
                character
            );
        });
    }

    async saveCharacter(characterId: string): Promise<void> {
        const character = this.characters[characterId];

        await this.db.upsert<Partial<RpgDocument>>(
            BlackguardDbDocName.Rpg,
            (doc) => {
                if (doc.characters === undefined) {
                    doc.characters = {};
                }

                doc.characters[characterId] = character
                    .toJsonCompatibleObject();
                return doc;
            }
        );
    }

    async getCharacter(characterId: string): Promise<Character> {
        if (!this.characters[characterId]) {
            this.characters[characterId] = new Character({
                ownerId: characterId
            });
            await this.saveCharacter(characterId);
        }

        return this.characters[characterId];
    }

    async resetFailStacks(characterId: string): Promise<void> {
        const character = this.characters[characterId];
        character.failStacks = 0;

        await this.saveCharacter(characterId);
    }

    async increaseFailStacks(characterId: string): Promise<void> {
        const character = this.characters[characterId];
        character.failStacks += 1;

        await this.saveCharacter(characterId);
    }

    async enhanceEquipment(
        ownerId: string,
        equipmentType: EquipmentType
    ): Promise<Response> {
        const { value: wallet } = await Economy.getWallet(ownerId);

        if (!wallet) {
            return response(responseCodes.doesntExist);
        }

        const character = await this.getCharacter(ownerId);
        const itemLevel = character.equipmentLevels[equipmentType];
        const { cost, chance } = this.equipmentStats.upgrades[itemLevel];

        if (wallet.bank < cost) {
            return response(responseCodes.economy.insufficientFunds);
        }

        const { responseCode } = await Economy.modifyCurrency(
            ownerId,
            -cost,
            CurrencyLocation.Bank
        );

        if (responseCode !== responseCodes.success) {
            return response(responseCodes.failure);
        }

        const enhanceRoll = Math.random();

        if (enhanceRoll <= chance) {
            character.equipmentLevels[equipmentType] += 1;
            await this.saveCharacter(ownerId);
            return response(responseCodes.success);
        }

        return response(responseCodes.failure);
    }

    clearJugCooldown(juggerId: string): Response {
        if (!juggerId) {
            Object.values(this.jugging.playerCooldowns).forEach(({ timer }) => {
                clearTimeout(timer);
            });
            this.jugging.playerCooldowns = {};
        } else if (this.jugging.playerCooldowns[juggerId]) {
            this.jugging.playerCooldowns[juggerId].isActive = false;
            clearTimeout(this.jugging.playerCooldowns[juggerId].timer);
        } else {
            return response(responseCodes.userDoesNotExist);
        }

        return response(responseCodes.success);
    }

    startJugCooldown(juggerId: string): void {
        clearTimeout(this.jugging.playerCooldowns[juggerId].timer);

        this.jugging.playerCooldowns[juggerId] = {
            isActive: true,
            endTime: Date.now() + this.jugging.cooldownLength,
            timer: setTimeout(() => {
                this.jugging.playerCooldowns[juggerId].isActive = false;
            }, this.jugging.cooldownLength)
        };
    }

    async npcJug(juggerId: string): Promise<Response> {
        const { value: wallets } = await Economy.getAllWallets();

        const juggersWallet = wallets[juggerId];

        if (!juggersWallet) {
            return response(responseCodes.economy.noFromUser);
        }

        const character = await this.getCharacter(juggerId);
        const juggingRoll = Math.random();

        this.startJugCooldown(juggerId);
        const weapon = this.equipmentStats
            .weapon[character.equipmentLevels.weapon];
        const { successChance, baseRewardCeiling, baseRewardFloor } =
            this.jugging.pve;
        if (juggingRoll <= successChance) {
            const jugAmount = Math.round(random(
                Character.getModifiedRewardValue(
                    baseRewardFloor,
                    weapon.rewardModifier
                ),
                Character.getModifiedRewardValue(
                    baseRewardCeiling,
                    weapon.rewardModifier
                )
            ));

            await Economy.modifyCurrency(juggerId, jugAmount);
            return response(responseCodes.success, {
                finalJugAmount: jugAmount,
                cooldownEndTime: this.jugging.playerCooldowns[juggerId]
                    .endTime
            });
        } else {
            await this.increaseFailStacks(juggerId);
            return response(
                responseCodes.failure,
                this.jugging.playerCooldowns[juggerId].endTime
            );
        }
    }

    async jug(
        juggerId: string,
        victimId: string | null,
        initialJugAmount: string
    ): Promise<Response> {
        if (this.jugging.playerCooldowns[juggerId]?.isActive) {
            return response(
                responseCodes.onCooldown,
                this.jugging.playerCooldowns[juggerId].endTime
            );
        }

        if (victimId === null) {
            return this.npcJug(juggerId);
        }

        if (
            initialJugAmount.toLowerCase() !== "all"
            && (isNaN(+initialJugAmount) || +initialJugAmount <= 0)
        ) {
            return response(responseCodes.invalidInput);
        }

        const { value: wallets } = await Economy.getAllWallets();

        const juggersWallet = wallets[juggerId];
        const victimWallet = wallets[victimId];

        if (!juggersWallet) {
            return response(responseCodes.economy.noFromUser);
        }

        if (!victimWallet) {
            return response(responseCodes.economy.noToUser);
        }

        if (juggerId === victimId) {
            return response(responseCodes.economy.sameUser);
        }

        const jugAmount = initialJugAmount.toLowerCase() === "all"
            ? juggersWallet.value
            : +initialJugAmount;
        if (juggersWallet.value < jugAmount) {
            return response(responseCodes.economy.insufficientFunds);
        }

        const juggingRoll = Math.random();

        this.startJugCooldown(juggerId);
        const {
            successChance,
            counterChance,
            counterRewardCeiling,
            counterRewardFloor
        } = this.jugging.pvp;
        const character = await this.getCharacter(juggerId);
        const { failStacks, equipmentLevels } = character;
        const { armor: armorLevel, weapon: weaponLevel } = equipmentLevels;
        const { recovery, failStackModifier } =
            this.equipmentStats.armor[armorLevel];
        const { rewardFloor, rewardCeiling, rewardModifier } =
            this.equipmentStats.weapon[weaponLevel];
        const realSuccessChance = successChance
            + ((failStackModifier + 0.001) * failStacks);

        if (juggingRoll <= realSuccessChance) {
            await this.resetFailStacks(juggerId);
            const jugMultiplier = random(
                Character.getModifiedRewardValue(
                    rewardFloor,
                    rewardModifier
                ),
                Character.getModifiedRewardValue(
                    rewardCeiling,
                    rewardModifier
                )
            );
            const idealJugAmount = Math.round(
                jugAmount * jugMultiplier
            );
            const finalJugAmount = Math.max(
                victimWallet.value < idealJugAmount
                    ? victimWallet.value
                    : idealJugAmount,
                1
            );

            const { responseCode } = await Economy.transferCurrency(
                victimId,
                juggerId,
                finalJugAmount
            );

            if (responseCode !== responseCodes.success) {
                return response(responseCodes.failure);
            }

            return response(
                responseCodes.success,
                {
                    finalJugAmount,
                    cooldownEndTime:
                        this.jugging.playerCooldowns[juggerId].endTime
                }
            );
        } else {
            await this.increaseFailStacks(juggerId);
            const counterRoll = Math.random();

            if (counterRoll <= counterChance) {
                const counterAmount = random(
                    counterRewardCeiling,
                    counterRewardFloor
                );
                const finalCounterAmount = Math.max(
                    Math.round(jugAmount * counterAmount),
                    1
                );

                const transferResponse = await Economy.transferCurrency(
                    juggerId,
                    victimId,
                    finalCounterAmount
                );

                const reductionResponse = await Economy.modifyCurrency(
                    juggerId,
                    -Math.round(jugAmount * (1 - recovery))
                );

                if (
                    transferResponse.responseCode !== responseCodes.success
                    || reductionResponse.responseCode !== responseCodes.success
                ) {
                    return response(responseCodes.failure);
                }

                return response(
                    responseCodes.economy.jug.counterSuccess,
                    {
                        finalJugAmount: finalCounterAmount,
                        cooldownEndTime: this.jugging.playerCooldowns[juggerId]
                            .endTime
                    }
                );
            } else {
                await Economy.modifyCurrency(
                    juggerId,
                    -Math.round(jugAmount * (1 - recovery))
                );

                return response(
                    responseCodes.failure,
                    this.jugging.playerCooldowns[juggerId].endTime
                );
            }
        }
    }
}

export const Rpg = new RpgController();
