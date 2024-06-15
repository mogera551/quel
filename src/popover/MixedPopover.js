import "../types.js";
import { Symbols } from "../Symbols.js";
import { utils } from "../utils.js";

export class MixedPopover {
  /** @type {boolean} */
  get canceled() {
    return this._canceled ?? false;
  }
  set canceled(value) {
    this._canceled = value;
  }

  /** @type {Promise<unknown>} */
  get popoverPromises() {
    return this._popoverPromises;
  }
  set popoverPromises(value) {
    this._popoverPromises = value;
  }

  /**
   * initialize
   * @returns {void}
   */
  initializeCallback() {
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
      }
      if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
        if (!this.canceled) {
          this.props[Symbols.flushBuffer]();
        }
      }
      this.canceled = true;
      // remove loop context
      const id = this.id;
      if (typeof id !== "undefined") {
        this.popoverContextIndexesById.delete(id);
      }
    });
    this.addEventListener("shown", () => {
      this.canceled = true;
      if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
        const buffer = this.props[Symbols.createBuffer]();
        this.props[Symbols.setBuffer](buffer);
      }
      for(const key in this.props) {
        this.viewModel[Symbols.notifyForDependentProps](key, []);
      }
    });
    this.addEventListener("toggle", e => {
      if (e.newState === "closed") {
        const hiddenEvent = new CustomEvent("hidden");
        this.dispatchEvent(hiddenEvent);
      } else if (e.newState === "open") {
        const shownEvent = new CustomEvent("shown");
        this.dispatchEvent(shownEvent);
      }
    });
    //console.log("popoverMixIn:initializeCallback");
  }
  /**
   * 
   * @param {Object<string,any>} props 
   * @returns 
   */
  async asyncShowPopover(props) {
    this.popoverPromises = Promise.withResolvers();
    this.props[Symbols.setBuffer](props);
    HTMLElement.prototype.showPopover.apply(this);
    return this.popoverPromises.promise;
  }
  /**
   * 
   */
  hidePopover() {
    this.canceled = false;
    HTMLElement.prototype.hidePopover.apply(this);
  }
  /**
   * 
   */
  cancelPopover() {
    HTMLElement.prototype.hidePopover.apply(this);
  }

  /** 
   * @type {Map<string,BindingManager>}
   * 
   */
  get popoverContextIndexesById() {
    if (typeof this._popoverContextIndexesById === "undefined") {
      this._popoverContextIndexesById = new Map;
    }
    return this._popoverContextIndexesById;
  }

  get accessibleProperties() {
    if (this.hasAttribute("popover")) {
      return ["showPopover", "asyncShowPopover", "hidePopover", "cancelPopover"];
    }
  }
}
