import { Symbols } from "../Symbols.js";

export const popoverMixIn = {
  /** @type {Promise<unknown>} */
  get popoverPromises() {
    return this._popoverPromises;
  },
  set popoverPromises(value) {
    this._popoverPromises = value;
  },
  /**
   * initialize
   * @param {{
   * useWebComponent: boolean,
   * useShadowRoot: boolean,
   * useLocalTagName: boolean,
   * useKeyed: boolean,
   * useBufferedBind: boolean
   * }} param0
   * @returns {void}
   */
  initializeCallback({
    useWebComponent, useShadowRoot, useLocalTagName, useKeyed, useBufferedBind
  }) {
  },
  /**
   * 
   * @param {Object<string,any>} props 
   * @returns 
   */
  async asyncShowPopover(props) {
    this.popoverPromises = Promise.withResolvers();
    this.props[Symbols.setBuffer](props);
    HTMLElement.prototype.showPopover.apply(this);
    return this.popoverPromises;
  },
  hidePopover() {
    HTMLElement.prototype.hidePopover.apply(this);
    if (!this.hasAttribute("popover") && typeof this.popoverPromises !== "undefined") {
      const buffer = this.props[Symbols.getBuffer]();
      this.props[Symbols.clearBuffer]();
      this.popoverPromises.resolve(buffer);
      this.popoverPromises = undefined;
    }
  }

}
