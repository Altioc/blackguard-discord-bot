const { StringSelect } = require('./components/string-select');
const { SecondaryButton, SuccessButton } = require('./components/button');
const { Row } = require('./components/row');
const { View } = require('./view');

class MultiSelectView extends View {
  init(props = {}) {
    const allOptions = props.options;
    this.pages = allOptions?.reduce((pages, option) => {
      const currentPageIndex = pages.length - 1;
      pages[currentPageIndex].set(option.id, option);

      if (pages[currentPageIndex].size === 25) {
        pages.push(new Map());
      } 

      return pages;
    }, [new Map()]) || [];

    this.state.currentPageIndex = 0;
    this.state.selectedOptions = new Set();
  }

  get lastPageIndex() {
    return this.pages.length - 1;
  }

  get firstPageIndex() { 
    return 0; 
  }

  get currentPage() {
    return this.pages[this.state.currentPageIndex];
  }

  onSelectInteraction() {
    const { values } = this.interaction;
    const newSelectedOptions = new Set(this.state.selectedOptions);
    console.log(newSelectedOptions);
    this.currentPage.forEach((option) => {
      if (values.includes(option.id)) {
        option.selected = !option.selected;
      }

      if (option.selected) {
        newSelectedOptions.add(option.id);
      } else {
        newSelectedOptions.delete(option.id);
      }
    });

    this.state.selectedOptions = newSelectedOptions;
  }

  onNextInteraction() {
    this.state.currentPageIndex += 1;
  }

  onPrevInteraction() {
    this.state.currentPageIndex -= 1;
  }

  onSubmitInteraction() {
    console.log('submit');
  }

  onCancelInteraction() {
    console.log('cancel');
  }

  render() {
    return {
      content: `pages: ${this.pages.length}, current page: ${this.state.currentPageIndex}, last page: ${this.lastPageIndex} ${Array.from(this.currentPage.values())[0]?.icon}`,
      components: [
        Row(
          StringSelect({
            id: 'Select',
            options: Array.from(this.currentPage.values()),
            placeholder: this.props.placeholder,
            selectedOptions: this.state.selectedOptions
          })
        ),
        Row (
          SecondaryButton({
            label: 'Prev',
            disabled: this.state.currentPageIndex === this.firstPageIndex
          }),
          SecondaryButton({
            label: 'Next',
            disabled: this.state.currentPageIndex === this.lastPageIndex
          })
        ),
        Row(
          SuccessButton({
            label: 'Submit'
          }),
          SecondaryButton({
            label: 'Cancel'
          })
        )
      ]
    };
  }
}

module.exports = {
  MultiSelectView
};
