import { CharacterConstructorParameters } from "../types/CharacterConstructorParameters";
import { CharacterEquipmentLevels } from "../types/CharacterEquipmentLevels";

export class Character {
    ownerId: string;
    level: number;
    failStacks: number;
    equipmentLevels: CharacterEquipmentLevels;

    constructor(
        { ownerId, equipmentLevels, level, failStacks }:
            CharacterConstructorParameters
    ) {
        this.ownerId = ownerId;
        this.level = level || 1;
        this.failStacks = failStacks || 0;
        this.equipmentLevels = {
            weapon: 0,
            armor: 0,
            ...(equipmentLevels || {})
        };
    }

    static getModifiedRewardValue(baseValue: number, modifier: number): number {
        return +(baseValue * (1 + modifier)).toFixed(3);
    }

    toJsonCompatibleObject(): CharacterConstructorParameters {
        return {
            ownerId: this.ownerId,
            level: this.level,
            failStacks: this.failStacks,
            equipmentLevels: this.equipmentLevels
        };
    }
}
