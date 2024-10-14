import { Index } from "../dotNotation/types";
import { utils } from "../utils";
import { ILoopIndexes } from "./types";

const _pool: LoopIndexes[] = [];

class LoopIndexes implements ILoopIndexes {
  #parentLoopIndexes: ILoopIndexes | undefined;
  #_values: Index[] | undefined;
  #_value: Index;
  #values: Index[] | undefined;
  #stringValue: string | undefined;
  #index: number | undefined;
  get parentLoopIndexes(): ILoopIndexes | undefined {
    return this.#parentLoopIndexes;
  }
  get values(): Index[] {
    if (typeof this.#values === "undefined") {
      if (typeof this.parentLoopIndexes === "undefined") {
        this.#values = this.#_values as Index[];
      } else {
        this.#values = this.parentLoopIndexes.values.concat(this.#_value);
      }
    }
    return this.#values;
  }

  get index(): number {
    if (typeof this.#index === "undefined") {
      if (typeof this.parentLoopIndexes === "undefined") {
        this.#index = 0;
      } else {
        this.#index = this.parentLoopIndexes.index + 1;
      }
    }
    return this.#index
  }

  get size(): number {
    return this.index + 1;
  }

  truncate(length: number): ILoopIndexes | undefined {
    let loopIndexes: ILoopIndexes | undefined = this;
    while(typeof loopIndexes !== "undefined") {
      if (loopIndexes.index < length) return loopIndexes;
      loopIndexes = loopIndexes.parentLoopIndexes;
    }
    return undefined;
  }

  constructor({ parentLoopIndexes, value, values }: { 
    parentLoopIndexes: ILoopIndexes | undefined,
    value: Index,
    values: Index[] | undefined
  }) {
    if (typeof parentLoopIndexes === "undefined" && typeof values === "undefined") {
      utils.raise(`LoopIndexes.constructor: values cannot be set without parentLoopIndexes.`);
    }
    this.#parentLoopIndexes = parentLoopIndexes;
    this.#_value = value;
    this.#_values = values;
  }

  add(value: Index): ILoopIndexes {
    return new LoopIndexes({ parentLoopIndexes: this, value, values: undefined });
  }

  *backward(): Generator<Index> {
    if (typeof this.#parentLoopIndexes !== "undefined") {
      yield this.#_value;
      yield* this.#parentLoopIndexes.backward();
    } else {
      yield this.#_values?.[0];
    }
    return;
  }

  *forward(): Generator<Index> {
    if (typeof this.#parentLoopIndexes !== "undefined") {
      yield* this.#parentLoopIndexes.forward();
      yield this.#_value;
    } else {
      yield this.#_values?.[0];
    }
    return;
  }

  toString(): string {
    if (typeof this.#stringValue === "undefined") {
      if (typeof this.#parentLoopIndexes !== "undefined") {
        this.#stringValue = this.#parentLoopIndexes.toString() + "," + this.#_value;
      } else {
        this.#stringValue = this.#_values?.[0]?.toString() ?? "";
      }
    }
    return this.#stringValue;
  }

  at(index: number): number | undefined {
    let iterator;
    if (index >= 0) {
      iterator = this.forward();
    } else {
      index = - index - 1 
      iterator = this.backward();
    }
    let next;
    while(index >= 0) {
      next = iterator.next();
      index--;
    }
    return next?.value;
  }
}

export function createLoopIndexes(indexes: Index[], index = indexes.length - 1): ILoopIndexes {
  const value: Index = indexes[index];
  return new LoopIndexes({
    parentLoopIndexes: index > 0 ? createLoopIndexes(indexes, index - 1) : undefined,
    value: index > 0 ? value : undefined,
    values: index === 0 ? [value] : undefined
  });
}
