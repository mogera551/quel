import utils from "../utils.js";
import NodeUpdator, { NodeUpdateData } from "./NodeUpdator.js";
import Notifier, { NotifyData } from "./Notifier.js";
import Processor, { ProcessData } from "./Processor.js";

class Slot {
  /**
   * @type {Processor}
   */
  processor;
  /**
   * @type {Notifier}
   */
  notifier;
  /**
   * @type {NodeUpdator}
   */
  nodeUpdator;

  /**
   * 
   */
  constructor() {
    this.processor = new Processor;
    this.notifier = new Notifier;
    this.nodeUpdator = new NodeUpdator;
  }

  async exec() {
    do {
      await this.processor.exec();
      await this.notifier.exec();
      await this.nodeUpdator.exec();
    } while(!this.processor.isEmpty || !this.notifier.isEmpty || !this.nodeUpdator.isEmpty);
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
   * @type {Slot}
   */
  #slot;
  constructor() {
    this.main();
  }

  /**
   * 
   * @returns 
   */
  async sleep() {
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
   * @param {Slot} slot 
   */
  wakeup(slot) {
    this.#slot = slot;
    this.#resolve();
  }

  async main() {
    do {
      try {
        await this.sleep();
        performance.mark('slot-exec:start');
        try {
          await this.#slot.exec();
        } finally {
          this.#slot = undefined;
          console.log("slot.exec stopped");
          performance.mark('slot-exec:end')
          performance.measure('slot-exec', 'slot-exec:start', 'slot-exec:end');
          console.log(performance.getEntriesByType("measure"));    
          performance.clearMeasures();
          performance.clearMarks();
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

  /**
   * 
   * @param {ProcessData} process 
   */
  addProcess(process) {
    const slot = this.#slot ?? new Slot;
    slot.processor.queue.push(process);
    this.#slot || this.wakeup(slot);
  }

  /**
   * 
   * @param {NotifyData} notify 
   */
  addNotify(notify) {
    const slot = this.#slot ?? new Slot;
    slot.notifier.queue.push(notify);
    this.#slot || this.wakeup(slot);
  }

  /**
   * 
   * @param {NodeUpdateData} nodeUpdate 
   */
  addNodeUpdate(nodeUpdate) {
    const slot = this.#slot ?? new Slot;
    slot.nodeUpdator.queue.push(nodeUpdate);
    this.#slot || this.wakeup(slot);
  }

  /**
   * @type {Thread[]}
   */
  static stack = [];


  static start() {
    this.stack.push(new Thread());
  }

  /**
   * 現在のスレッド
   * @type {Thread} 
   */
  static get current() {
    return this.stack.at(-1);
  }

  /**
   * 別スレッドを作成する
   */
  static suspend() {
    this.stack.push(new Thread());
  }

  /**
   * 現在のスレッドを停止し、元のスレッドを復帰
   */
  static resume() {
    const curThread = this.stack.pop();
    curThread.stop();
  }
}

Thread.start();
