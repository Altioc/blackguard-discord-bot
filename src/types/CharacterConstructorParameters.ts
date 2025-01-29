import { CharacterEquipmentLevels } from "./CharacterEquipmentLevels";

export type CharacterConstructorParameters = {
    ownerId: string;
    level?: number;
    failStacks?: number;
    equipmentLevels?: CharacterEquipmentLevels;
};
