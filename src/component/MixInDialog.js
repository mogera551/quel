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
      if (this.returnValue === "") {
        this.mixInDialogPromises.reject();
      } else {
        this.mixInDialogPromises.resolve(this.props[Symbols.toObject]());
      }
    });
    this.addEventListener("close", () => {
      const closedEvent = new CustomEvent("closed");
      this.dispatchEvent(closedEvent);
    });
  },
  async _show(props, modal = true) {
    this.returnValue = "";
    this.mixInDialogPromises = Promise.withResolvers();
    if (!this.mixInDialogInitialized) {
      this.mixInDialogInit();
    }
    this.props = props;
    if (modal) {
      this.showModal();
    } else {
      this.show();
    }
    return this.mixInDialogPromises.promise;
  },
  async asyncShowModal(props) {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: asyncShowModal is only for HTMLDialogElement");
    }
    return this._show(props, true);
  },
  async asyncShow(props) {
    if (!(this instanceof HTMLDialogElement)) {
      utils.raise("mixInDialog: asyncShow is only for HTMLDialogElement");
    }
    return this._show(props, false);
  }

}

