const { v4: uuid } = require('uuid');
const { hour } = require('../constants');
const capitalize = require('../utils/capitalize');

class View {
  constructor(interaction, props) {
    this._interacted = false;
    this.id = uuid();
    this.interaction = interaction;
    this.props = props;
    this._internalState = new Map();
    this.ephemeral = props.ephemeral || false;
    this.state = new Proxy({}, {
      get: (_, key) => {
        return this._internalState.get(key);
      },
      set: (_, key, value) => {
        const oldValue = this._internalState.get(key);
        this._internalState.set(key, value);

        if (oldValue !== undefined && this[key] !== oldValue) {
          this._doRender();
        }

        return true;
      },
    });

    this.init?.(props);
    this._doRender();
  }

  async _doRender() {
    const interactionMethod = this._interacted ? 'update' : 'reply';
    
    const response = await this.interaction[interactionMethod]({
      ephemeral: this.ephemeral,
      ...this.render(),
    });

    if (this._interacted) {
      return;
    }

    this._interacted = true;
    const interactionCollector = response.createMessageComponentCollector({
      time: hour,
    });
    interactionCollector.on('collect', (interaction) => {
      this.interaction = interaction;

      const capitalizedCustomId = capitalize(`${interaction.customId}`);
      const handlerName = `on${capitalizedCustomId}Interaction`;

      this[handlerName]?.();
    });
  }
}

module.exports = {
  View,
};
