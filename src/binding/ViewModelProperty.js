import "../types.js";

export class ViewModelProperty {
  /** @type { ViewModel } */
  #viewModel;
  /** @type { ViewModel } */
  get viewModel() {
    return this.#viewModel;
  }
  set viewModel(value) {
    this.#viewModel = value;
  }
  /** @type { string } */
  #propertyName;
  /** @type { string } */
  get propertyName() {
    return this.#propertyName;
  }
  set propertyName(value) {
    this.#propertyName = value;
  }

  /** @type {any} */
  get value() {
    return this.viewModel[this.propertyName];
  }
  set value(value) {
    this.viewModel[this.propertyName] = value;
  }

}