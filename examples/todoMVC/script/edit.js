export const html = ``;

export class ViewModel {
  /**
   * called when the component is connected to the DOM
   */
  async $connectedCallback() {
    setTimeout(() => this.$component.focus(), 0);
  }
}

export const options = { extends:"input" };
