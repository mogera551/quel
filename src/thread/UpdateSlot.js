import { NodeUpdator, NodeUpdateData } from "./NodeUpdator.js";
import { NotifyReceiver } from "./NotifyReceiver.js";
import { ViewModelUpdator, ProcessData } from "./ViewModelUpdator.js";

/**
 * @typedef {(status:UpdateSlotStatus)=>{}} UpdateSlotStatusCallback
 */
export class UpdateSlot {
  /**
   * @type {ViewModelUpdator}
   */
  #viewModelUpdator;
  get viewModelUpdator() {
    return this.#viewModelUpdator;
  }
  /**
   * @type {NotifyReceiver}
   */
  #notifyReceiver;
  get notifyReceiver() {
    return this.#notifyReceiver;
  }
  /**
   * @type {NodeUpdator}
   */
  #nodeUpdator;
  get nodeUpdator() {
    return this.#nodeUpdator;
  }
  /**
   * @type {()=>{}}
   */
  #callback;
  /**
   * @type {Promise<void>}
   */
  #waitPromise;
  /**
   * @type {Promise<void>}
   */
  #alivePromise;

  /**
   * @type {(value) => {}}
   */
  #waitResolve;
  /**
   * @type {() => {}}
   */
  #waitReject;
  /**
   * @type {(value) => {}}
   */
  #aliveResolve;
  /**
   * @type {() => {}}
   */
  #aliveReject;
  
  /**
   * 
   * @param {import("../component/Component.js").Component} component
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
   * @param {import("../../modules/dot-notation/dot-notation.js").PropertyAccess} notifyData 
   */
  async addNotify(notifyData) {
    this.#notifyReceiver.queue.push(notifyData);
    this.#waitResolve(true); // waitingを解除する
  }

  /**
   * 
   * @param {NodeUpdateData} nodeUpdateData 
   */
  async addNodeUpdate(nodeUpdateData) {
    this.#nodeUpdator.queue.push(nodeUpdateData);
    this.#waitResolve(true); // waitingを解除する
  }

  /**
   * 
   */
  callback() {
    this.#callback && this.#callback();
  }

  /**
   * 
   * @param {import("../component/Component.js").Component} component
   * @param {()=>{}} callback 
   * @param {UpdateSlotStatusCallback} statusCallback 
   * @returns 
   */
  static create(component, callback, statusCallback) {
    return new UpdateSlot(component, callback, statusCallback);
  }

}
