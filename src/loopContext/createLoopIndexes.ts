import { Index } from "../dotNotation/types";
import { ILoopIndexes } from "./types";

const _pool: LoopIndexes[] = [];

class LoopIndexes implements ILoopIndexes {
  #parentLoopIndexes: ILoopIndexes | undefined;
  #_value: Index;
  #values: Index[] | undefined;
  #stringValue: string | undefined;
  #index: number | undefined;
  get parentLoopIndexes(): ILoopIndexes | undefined {
    return this.#parentLoopIndexes;
  }

  get value(): Index {
    return this.#_value;
  }

  get values(): Index[] {
    if (typeof this.#values === "undefined") {
      if (typeof this.parentLoopIndexes === "undefined") {
        this.#values = [this.#_value];
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

  constructor(
    parentLoopIndexes: ILoopIndexes | undefined,
    value: Index,
  ) {
    this.#parentLoopIndexes = parentLoopIndexes;
    this.#_value = value;
  }

  add(value: Index): ILoopIndexes {
    return new LoopIndexes(this, value);
  }

  *backward(): Generator<Index> {
    yield this.#_value;
    if (typeof this.#parentLoopIndexes !== "undefined") {
      yield* this.#parentLoopIndexes.backward();
    }
    return;
  }

  *forward(): Generator<Index> {
    if (typeof this.#parentLoopIndexes !== "undefined") {
      yield* this.#parentLoopIndexes.forward();
    }
    yield this.#_value;
    return;
  }

  toString(): string {
    if (typeof this.#stringValue === "undefined") {
      if (typeof this.#parentLoopIndexes !== "undefined") {
        this.#stringValue = this.#parentLoopIndexes.toString() + "," + this.#_value;
      } else {
        this.#stringValue = this.#_value?.toString() ?? "";
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

export function createLoopIndexesFromArray(indexes: Index[], index = indexes.length - 1): ILoopIndexes {
  const value: Index = indexes[index];
  return new LoopIndexes(
    index > 0 ? createLoopIndexesFromArray(indexes, index - 1) : undefined,
    value
  );
}

export function createLoopIndexes(
  parentLoopIndexes: ILoopIndexes | undefined, 
  value: Index
): ILoopIndexes {
  return (typeof parentLoopIndexes === "undefined") ? createLoopIndexesFromArray([value]) : parentLoopIndexes.add(value);
}