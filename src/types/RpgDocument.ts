import { BlackguardDbDocName } from "../constants";
import { CharacterConstructorParameters } from "./CharacterConstructorParameters";
import { MinimumDocument } from "./MinimumDocument";
import { RpgArmor } from "./RpgArmor";
import { RpgJuggingConfig } from "./RpgJuggingConfig";
import { RpgUpgrade } from "./RpgUpgrade";
import { RpgWeapon } from "./RpgWeapon";

export type RpgDocument = MinimumDocument & {
    _id: BlackguardDbDocName.Rpg;
    characters: Record<string, CharacterConstructorParameters>;
    config: {
        equipmentStats: {
            upgrades: RpgUpgrade[];
            weapon: RpgWeapon[];
            armor: RpgArmor[];
        };
        jug: RpgJuggingConfig;
    };
};
