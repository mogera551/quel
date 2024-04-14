import { Symbols } from "../Symbols.js";
import { utils } from "../utils.js";

export const dialogMixIn = {
  /** @type {Promise<unknown>} */
  get dialogPromises() {
    return this._dialogPromises;
  },
  set dialogPromises(value) {
    this._dialogPromises = value;
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
    this.addEventListener("closed", () => {
      if (typeof this.dialogPromises !== "undefined") {
        if (this.returnValue === "") {
          this.dialogPromises.reject();
        } else {
          const buffer = this.props[Symbols.getBuffer]();
          this.props[Symbols.clearBuffer]();
          this.dialogPromises.resolve(buffer);
        }
        this.dialogPromises = undefined;
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
    //console.log("dialogMixIn:initializeCallback");
  },
  /**
   * 
   * @param {Object<string,any} props 
   * @param {boolean} modal 
   * @returns 
   */
  async _show(props, modal = true) {
    this.returnValue = "";
    this.dialogPromises = Promise.withResolvers();
    this.props[Symbols.setBuffer](props);
    if (modal) {
      HTMLDialogElement.prototype.showModal.apply(this);
    } else {
      HTMLDialogElement.prototype.show.apply(this);
    }
    return this.dialogPromises.promise;
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
  /**
   * 
   * @returns 
   */
  showModal() {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: showModal is only for HTMLDialogElement");
    }
    if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
      this.returnValue = "";
      const buffer = this.props[Symbols.createBuffer]();
      this.props[Symbols.setBuffer](buffer);
    }
    return HTMLDialogElement.prototype.showModal.apply(this);
  },
  /**
   * 
   * @returns 
   */
  show() {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: show is only for HTMLDialogElement");
    }
    if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
      this.returnValue = "";
      const buffer = this.props[Symbols.createBuffer]();
      this.props[Symbols.setBuffer](buffer);
    }
    return HTMLDialogElement.prototype.show.apply(this);
  },
  /**
   * 
   * @param {string} returnValue 
   * @returns 
   */
  close(returnValue) {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: close is only for HTMLDialogElement");
    }
    return HTMLDialogElement.prototype.close.apply(this, [returnValue]);
  },

}

