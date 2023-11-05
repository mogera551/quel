import "../types.js";
import { NodeUpdator, NodeUpdateData } from "./NodeUpdator.js";
import { NotifyReceiver } from "./NotifyReceiver.js";
import { ViewModelUpdator, ProcessData } from "./ViewModelUpdator.js";

/**
 * @typedef {(status:UpdateSlotStatus)=>{}} UpdateSlotStatusCallback
 */
export class UpdateSlot {
  /** @type {ViewModelUpdator} */
  #viewModelUpdator;
  /** @type {ViewModelUpdator} */
  get viewModelUpdator() {
    return this.#viewModelUpdator;
  }

  /** @type {NotifyReceiver} */
  #notifyReceiver;
  /** @type {NotifyReceiver} */
  get notifyReceiver() {
    return this.#notifyReceiver;
  }

  /** @type {NodeUpdator} */
  #nodeUpdator;
  /** @type {NodeUpdator} */
  get nodeUpdator() {
    return this.#nodeUpdator;
  }

  /** @type {()=>void} */
  #callback;

  /** @type {Promise<void>} */
  #waitPromise;

  /** @type {Promise<void>} */
  #alivePromise;

  /** @type {Promise<(value)=>void>} */
  #waitResolve;

  /** @type {Promise<() => void>} */
  #waitReject;

  /** @type {Promise<(value) => void>} */
  #aliveResolve;

  /** @type {Promise<() => void>} */
  #aliveReject;
  
  /**
   * 
   * @param {Component} component
   * @param {()=>{}?} callback
   * @param {UpdateSlotStatusCallback?} statusCallback
   */
  constructor(component, callback = null, statusCallback = null) {
    this.#viewModelUpdator = new ViewModelUpdator(statusCallback);
    this.#notifyReceiver = new NotifyReceiver(component, statusCallback);
    this.#nodeUpdator = new NodeUpdator(statusCallback);
    this.#callback = callback;
    this.#waitPromise = new Promise((resolve, reject) => {
      this.#waitResolve = resolve;
      this.#waitReject = reject;
    });
    this.#alivePromise = new Promise((resolve, reject) => {
      this.#aliveResolve = resolve;
      this.#aliveReject = reject;
    });
  }

  /**
   * 
   * @returns {Promise<void>}
   */
  async waiting() {
    return this.#waitPromise;
  }

  waitResolve(value) {
    this.#waitResolve(value);
  }
  waitReject() {
    this.#waitReject();
  }

  /**
   * 
   * @returns {Promise<void>}
   */
  async alive() {
    return this.#alivePromise;
  }

  async exec() {
    do {
      await this.#viewModelUpdator.exec();
      await this.#notifyReceiver.exec();
      await this.#nodeUpdator.exec();
    } while(!this.#viewModelUpdator.isEmpty || !this.#notifyReceiver.isEmpty || !this.#nodeUpdator.isEmpty);
    this.#aliveResolve();
  }

  /**
   * 
   * @param {ProcessData} processData 
   */
  async addProcess(processData) {
    this.#viewModelUpdator.queue.push(processData);
    this.#waitResolve(true); // waitingを解除する
  }
  
  /**
   * 
   * @param {PropertyAccess} notifyData 
   */
  async addNotify(notifyData) {
    this.#notifyReceiver.queue.push(notifyData);
    this.#waitResolve(true); // waitingを解除する
  }

  /**
   * 
   * @param {import("../binding/Binding.js").Binding} binding 
   */
  async addNodeUpdate(binding) {
    this.#nodeUpdator.queue.add(binding);
    this.#waitResolve(true); // waitingを解除する
  }

  /** 
   * @returns {void}
   */
  callback() {
    this.#callback && this.#callback();
  }

  /**
   * 
   * @param {Component} component
   * @param {()=>{}} callback 
   * @param {UpdateSlotStatusCallback} statusCallback 
   * @returns {UpdateSlot}
   */
  static create(component, callback, statusCallback) {
    return new UpdateSlot(component, callback, statusCallback);
  }

}
