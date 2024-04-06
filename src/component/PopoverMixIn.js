import { Symbols } from "../Symbols.js";

export const popoverMixIn = {
  /** @type {boolean} */
  get canceled() {
    return this._canceled ?? false;
  },
  set canceled(value) {
    this._canceled = value;
  },

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
    this.addEventListener("hidden", () => {
      if (typeof this.popoverPromises !== "undefined") {
        if (this.canceled) {
          this.popoverPromises.reject();
        } else {
          const buffer = this.props[Symbols.getBuffer]();
          this.props[Symbols.clearBuffer]();
          this.popoverPromises.resolve(buffer);
        }
        this.popoverPromises = undefined;
        this.canceled = false;
      }
    });
    this.addEventListener("toggle", e => {
      if (e.newState === "closed") {
        const hiddenEvent = new CustomEvent("hidden");
        this.dispatchEvent(hiddenEvent);
      }
    });
    console.log("popoverMixIn:initializeCallback");
  },
  /**
   * 
   * @param {Object<string,any>} props 
   * @returns 
   */
  async asyncShowPopover(props) {
    this.canceled = false;
    this.popoverPromises = Promise.withResolvers();
    this.props[Symbols.setBuffer](props);
    HTMLElement.prototype.showPopover.apply(this);
    return this.popoverPromises.promise;
  },
  hidePopover() {
    HTMLElement.prototype.hidePopover.apply(this);
  },
  cancelPopover() {
    this.canceled = true;
    HTMLElement.prototype.hidePopover.apply(this);
  }

}
