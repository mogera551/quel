export class MultiValue {
  /** @type {any} */
  value;

  /** @type {boolean} */
  enabled;

  /**
   * 
   * @param {any} value 
   * @param {boolean} enabled 
   */
  constructor(value, enabled) {
    this.value = value;
    this.enabled = enabled;
  }
}