import "../types.js";
import { config } from "../Config.js";

class ThreadStop extends Error {

}

export class Thread {
  /** @type {Promises} */
  #promises;

  /** @type {boolean} */
  #alive = true;
  /** @type {boolean} */
  get alive() {
    return this.#alive;
  }

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
    this.#promises = Promise.withResolvers();
    return this.#promises.promise;
  }

  /**
   * @returns {void}
   */
  stop() {
    this.#promises.reject(new ThreadStop("stop"));
  }

  /**
   * @param {UpdateSlot} slot 
   * @returns {void}
   */
  wakeup(slot) {
    this.#promises.resolve(slot);
  }

  /**
   * @returns {void}
   */
  async main() {
    do {
      try {
        const slot = await this.#sleep(); // wakeup(slot)が呼ばれるまで待機
        await slot.waitPromises.promise; // queueにデータが入るまで待機
        config.debug && performance.mark('slot-exec:start');
        try {
          await slot.exec();
          if (config.debug) {
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
        if (e instanceof ThreadStop) {
          break;
        } else {
          console.error(e);
          if (!confirm("致命的なエラーが発生しました。続行しますか？")) {
            break;
          }
        }
      }
    } while(true);

    this.#alive = false;
  }

}
