import "../types.js";
import { NodeUpdator } from "./NodeUpdator.js";
import { NotifyReceiver } from "./NotifyReceiver.js";
import { Phase } from "./Phase.js";
import { ViewModelUpdator, ProcessData } from "./ViewModelUpdator.js";

/**
 * @typedef {(phase:import("./Phase.js").Phase, prevPhase:import("./Phase.js").Phase)=>{}} ChangePhaseCallback
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

  /** @type {ChangePhaseCallback} */
  #changePhaseCallback;

  /** @type {Phase} */
  #phase = Phase.sleep;
  get phase() {
    return this.#phase;
  }
  set phase(value) {
    const oldValue = this.#phase;
    this.#phase = value;
    if (typeof this.#changePhaseCallback !== "undefined") {
      this.#changePhaseCallback(value, oldValue);
    }
  }
  
  /**
   * 
   * @param {Component} component
   * @param {()=>{}?} callback
   * @param {ChangePhaseCallback?} changePhaseCallback
   */
  constructor(component, callback = null, changePhaseCallback = null) {
    this.#viewModelUpdator = new ViewModelUpdator();
    this.#notifyReceiver = new NotifyReceiver(component);
    this.#nodeUpdator = new NodeUpdator();
    this.#callback = callback;
    this.#changePhaseCallback = changePhaseCallback;
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

  /** @type {boolean} */
  get isEmpty() {
    return this.#viewModelUpdator.isEmpty && this.#notifyReceiver.isEmpty && this.#nodeUpdator.isEmpty;
  }

  async exec() {
    do {
      this.phase = Phase.updateViewModel;
      await this.#viewModelUpdator.exec();

      this.phase = Phase.gatherUpdatedProperties;
      await this.#notifyReceiver.exec();

      this.phase = Phase.applyToNode;
      await this.#nodeUpdator.exec();
    } while(!this.#viewModelUpdator.isEmpty || !this.#notifyReceiver.isEmpty || !this.#nodeUpdator.isEmpty);

    this.phase = Phase.terminate;
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
   * @param {any} value
   */
  async addNodeUpdate(binding, value) {
    this.#nodeUpdator.queue.set(binding, value);
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
   * @param {ChangePhaseCallback} changePhaseCallback 
   * @returns {UpdateSlot}
   */
  static create(component, callback, changePhaseCallback) {
    return new UpdateSlot(component, callback, changePhaseCallback);
  }

}
