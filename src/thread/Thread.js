import main from "../main.js";
import NodeUpdator, { NodeUpdateData } from "./NodeUpdator.js";
import Notifier, { NotifyData } from "./Notifier.js";
import Processor, { ProcessData } from "./Processor.js";

/**
 * @enum {number}
 */
export const UpdateSlotStatus = {
  beginProcess: 1,
  endProcess: 2,
  beginNotify: 3,
  endNotify: 4,
  beginNodeUpdate: 5,
  endNodeUpdate: 6,
};

/**
 * @typedef {(status:UpdateSlotStatus)=>{}} UpdateSlotStatusCallback
 */


export class UpdateSlot {
  /**
   * @type {Processor}
   */
  #processor;
  /**
   * @type {Notifier}
   */
  #notifier;
  /**
   * @type {NodeUpdator}
   */
  #nodeUpdator;
  /**
   * @type {()=>{}}
   */
  #callback;
  /**
   * @type {Promise}
   */
  #promise;
  /**
   * @type {(value) => {}}
   */
  #resolve;
  /**
   * @type {() => {}}
   */
  #reject;
  
  /**
   * 
   * @param {()=>{}?} callback
   * @param {UpdateSlotStatusCallback?} statusCallback
   */
  constructor(callback = null, statusCallback = null) {
    this.#processor = new Processor(statusCallback);
    this.#notifier = new Notifier(statusCallback);
    this.#nodeUpdator = new NodeUpdator(statusCallback);
    this.#callback = callback;
    this.#promise = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    })
  }

  resolve() {
    this.#resolve && this.#resolve();
    this.#resolve = null;
  }

  reject() {
    this.#reject && this.#reject();
    this.#reject = null;
  }

  async waiting() {
    return this.#promise;
  }

  async exec() {
    do {
      await this.#processor.exec();
      await this.#notifier.exec();
      await this.#nodeUpdator.exec();
    } while(!this.#processor.isEmpty || !this.#notifier.isEmpty || !this.#nodeUpdator.isEmpty);
  }

  /**
   * 
   * @param {ProcessData} processData 
   */
  addProcess(processData) {
    this.#processor.queue.push(processData);
    this.resolve();
  }
  
  /**
   * 
   * @param {NotifyData} notifyData 
   */
  addNotify(notifyData) {
    this.#notifier.queue.push(notifyData);
    this.resolve();
  }

  /**
   * 
   * @param {NodeUpdateData} nodeUpdateData 
   */
  addNodeUpdate(nodeUpdateData) {
    this.#nodeUpdator.queue.push(nodeUpdateData);
    this.resolve();
  }

  /**
   * 
   */
  callback() {
    this.#callback && this.#callback();
  }

  /**
   * 
   * @param {()=>{}} callback 
   * @param {UpdateSlotStatusCallback} statusCallback 
   * @returns 
   */
  static create(callback, statusCallback) {
    return new UpdateSlot(callback, statusCallback);
  }

}

export default class Thread {
  /**
   * @type {(value:any)=>{}}
   */
  #resolve;
  /**
   * @type {()=>{}}
   */
  #reject;

  /**
   * 
   */
  constructor() {
    this.main();
  }

  /**
   * 
   * @returns {Promise<UpdateSlot>}
   */
  async #sleep() {
    return new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }

  /**
   * 
   */
  stop() {
    this.#reject();
  }

  /**
   * 
   * @param {UpdateSlot} slot 
   */
  wakeup(slot) {
    this.#resolve(slot);
  }

  async main() {
    do {
      try {
        const slot = await this.#sleep();
        await slot.waiting(); // queueにデータが入るまで待機
        main.debug && performance.mark('slot-exec:start');
        try {
          await slot.exec();
          if (main.debug) {
            performance.mark('slot-exec:end')
            performance.measure('slot-exec', 'slot-exec:start', 'slot-exec:end');
            console.log(performance.getEntriesByType("measure"));    
            performance.clearMeasures();
            performance.clearMarks();
          }
        } finally {
          slot.callback();
        }
      } catch(e) {
        if (typeof e !== "undefined") {
          console.error(e);
          if (!confirm("致命的なエラーが発生しました。続行しますか？")) {
            break;
          }
        }
      }
    } while(true);
  }

}
