class Bet {
  constructor({ value, option, ownerId }) {
    this.value = +value;
    this.option = option;
    this.ownerId = ownerId;
  }

  toJsonCompatibleObject() {
    return {
      value: this.value,
      option: this.option,
      ownerId: this.ownerId,
    };
  }
}

module.exports = Bet;
