class Character {
  constructor({ ownerId, equipmentLevels, level, failStacks }) {
    this.ownerId = ownerId;
    this.level = level || 1;
    this.failStacks = failStacks || 0;
    this.equipmentLevels = {
      weapon: 0,
      armor: 0,
      ...(equipmentLevels || {}),
    };
  }

  static getModifiedRewardValue(baseValue, modifier) {
    return +(baseValue * (1 + modifier)).toFixed(3);
  }

  toJsonCompatibleObject() {
    return {
      ownerId: this.ownerId,
      level: this.level,
      failStacks: this.failStacks,
      equipmentLevels: this.equipmentLevels,
    };
  }
}

module.exports = Character;
