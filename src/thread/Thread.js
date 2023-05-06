import { Main } from "../main.js";

class ThreadStop extends Error {

}

export class Thread {
  /**
   * @type {(value:any)=>{}}
   */
  #resolve;
  /**
   * @type {()=>{}}
   */
  #reject;
  /**
   * @type {boolean}
   */
  #alive = true;
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
   * @returns {Promise<import("./UpdateSlot.js").UpdateSlot>}
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
    this.#reject(new ThreadStop("stop"));
  }

  /**
   * 
   * @param {import("./UpdateSlot.js").UpdateSlot} slot 
   */
  wakeup(slot) {
    this.#resolve(slot);
  }

  async main() {
    do {
      try {
        const slot = await this.#sleep();
        await slot.waiting(); // queueにデータが入るまで待機
        Main.debug && performance.mark('slot-exec:start');
        try {
          await slot.exec();
          if (Main.debug) {
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
