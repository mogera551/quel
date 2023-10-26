export class MultiValue {
  /** @type {any} */
  #value;
  get value() {
    return this.#value;
  }

  /** @type {boolean} */
  #enabled;
  get enabled() {
    return this.#enabled;
  }

  /**
   * 
   * @param {any} value 
   * @param {boolean} enabled 
   */
  constructor(value, enabled) {
    this.#value = value;
    this.#enabled = enabled;
  }
}