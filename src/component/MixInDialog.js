import { Symbols } from "../Symbols.js";
import { utils } from "../utils.js";

export const mixInDialog = {
  /** @type {boolean} */
  get mixInDialogInitialized() {
    return this._mixInDialogInitialized ?? false;
  },
  set mixInDialogInitialized(value) {
    this._mixInDialogInitialized = value;
  },
  /** @type {Promise<unknown>} */
  get mixInDialogPromises() {
    return this._mixInDialogPromises;
  },
  set mixInDialogPromises(value) {
    this._mixInDialogPromises = value;
  },
  /**
   * 
   */
  mixInDialogInit() {
    this.mixInDialogInitialized = true;
    this.addEventListener("closed", () => {
      if (typeof this.mixInDialogPromises !== "undefined") {
        if (this.returnValue === "") {
          this.mixInDialogPromises.reject();
        } else {
          const buffer = this.props[Symbols.getBuffer]();
          this.props[Symbols.clearBuffer]();
          this.mixInDialogPromises.resolve(buffer);
        }
        this.mixInDialogPromises = undefined;
      }
      if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
        if (this.returnValue !== "") {
          this.props[Symbols.flushBuffer]();
        }
      }
    });
    this.addEventListener("close", () => {
      const closedEvent = new CustomEvent("closed");
      this.dispatchEvent(closedEvent);
    });
  },
  /**
   * 
   * @param {Object<string,any} props 
   * @param {boolean} modal 
   * @returns 
   */
  async _show(props, modal = true) {
    this.returnValue = "";
    this.mixInDialogPromises = Promise.withResolvers();
    if (!this.mixInDialogInitialized) {
      this.mixInDialogInit();
    }
    this.props[Symbols.setBuffer](props);
    if (modal) {
      HTMLDialogElement.prototype.showModal.apply(this);
    } else {
      HTMLDialogElement.prototype.show.apply(this);
    }
    return this.mixInDialogPromises.promise;
  },
  /**
   * 
   * @param {Object<string,any>} props 
   * @returns 
   */
  async asyncShowModal(props) {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: asyncShowModal is only for HTMLDialogElement");
    }
    return this._show(props, true);
  },
  /**
   * 
   * @param {Object<string,any>} props 
   * @returns 
   */
  async asyncShow(props) {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: asyncShow is only for HTMLDialogElement");
    }
    return this._show(props, false);
  },
  showModal() {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: showModal is only for HTMLDialogElement");
    }
    if (!this.mixInDialogInitialized) {
      this.mixInDialogInit();
    }
    if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
      this.returnValue = "";
      const buffer = this.props[Symbols.createBuffer]();
      this.props[Symbols.setBuffer](buffer);
    }
    const returnValue = HTMLDialogElement.prototype.showModal.apply(this);
    return returnValue;
  },
  show() {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: show is only for HTMLDialogElement");
    }
    if (!this.mixInDialogInitialized) {
      this.mixInDialogInit();
    }
    if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
      this.returnValue = "";
      const buffer = this.props[Symbols.createBuffer]();
      this.props[Symbols.setBuffer](buffer);
    }
    const returnValue = HTMLDialogElement.prototype.show.apply(this);
    return returnValue;
  },
  close(returnValueByClose) {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: close is only for HTMLDialogElement");
    }
    const returnValue = HTMLDialogElement.prototype.close.apply(this, [returnValueByClose]);
    return returnValue;
  },

}

