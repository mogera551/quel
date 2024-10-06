import { utils } from "../utils";
import { ILoopIndexes } from "./types";

const _pool: LoopIndexes[] = [];

class LoopIndexes implements ILoopIndexes {
  #parentLoopIndexes: ILoopIndexes | undefined;
  #_values: number[] | undefined;
  #_value: number | undefined;
  #values: number[] | undefined;
  #disposed = false;
  get parentLoopIndexes(): ILoopIndexes | undefined {
    return this.#parentLoopIndexes;
  }
  get values(): number[] {
    if (typeof this.#values === "undefined") {
      if (typeof this.parentLoopIndexes === "undefined") {
        this.#values = this.#_values as number[];
      } else {
        this.#values = this.parentLoopIndexes.values.concat(this.#_value as number);
      }
    }
    return this.#values;
  }
  get disposed(): boolean {
    return this.#disposed;
  }
  set disposed(value: boolean) {
    this.#disposed = value;
  }

  constructor({ parentLoopIndexes, value, values }: { 
    parentLoopIndexes: ILoopIndexes | undefined,
    value: number | undefined,
    values: number[] | undefined
  }) {
    if (typeof value !== "undefined" && typeof values !== "undefined") {
      utils.raise(`LoopIndexes.constructor: value and values cannot be set at the same time.`);
    }
    if (typeof value === "undefined" && typeof values === "undefined") {
      utils.raise(`LoopIndexes.constructor: value or values must be set.`);
    }
    if (typeof parentLoopIndexes !== "undefined" && typeof value === "undefined") {
      utils.raise(`LoopIndexes.constructor: value cannot be set with parentLoopIndexes.`);
    }
    if (typeof parentLoopIndexes === "undefined" && typeof values === "undefined") {
      utils.raise(`LoopIndexes.constructor: values cannot be set without parentLoopIndexes.`);
    }
    this.#parentLoopIndexes = parentLoopIndexes;
    this.#_value = value;
    this.#_values = values;
  }

  assignValue({ parentLoopIndexes, value, values }: { 
    parentLoopIndexes: ILoopIndexes | undefined,
    value: number | undefined,
    values: number[] | undefined
  }): void {
    if (typeof value !== "undefined" && typeof values !== "undefined") {
      utils.raise(`LoopIndexes.assignValue: value and values cannot be set at the same time.`);
    }
    if (typeof value === "undefined" && typeof values === "undefined") {
      utils.raise(`LoopIndexes.assignValue: value or values must be set.`);
    }
    if (typeof parentLoopIndexes !== "undefined" && typeof value === "undefined") {
      utils.raise(`LoopIndexes.assignValue: value cannot be set with parentLoopIndexes.`);
    }
    if (typeof parentLoopIndexes === "undefined" && typeof values === "undefined") {
      utils.raise(`LoopIndexes.assignValue: values cannot be set without parentLoopIndexes.`);
    }
    this.#parentLoopIndexes = parentLoopIndexes;
    this.#_value = value;
    this.#_values = values;
    this.#values = undefined;
  }

  add(index: number): ILoopIndexes {
    return new LoopIndexes({ parentLoopIndexes: this, value: index, values: undefined });
  }

  dispose(): void {
    this.#disposed = true;
    this.#parentLoopIndexes = undefined;
    this.#_value = undefined;
    this.#_values = undefined;
    this.#values = undefined;
  }
}

export function createLoopIndexes(indexes: number[], index = indexes.length - 1): ILoopIndexes {
  const value = indexes[index];
  if (_pool.length > 0) {
    const loopIndexes = _pool.pop() as LoopIndexes;
    loopIndexes.disposed = false;
    loopIndexes.assignValue({
      parentLoopIndexes: index > 0 ? createLoopIndexes(indexes, index - 1) : undefined,
      value: index > 0 ? value : undefined,
      values: index === 0 ? [value] : undefined
    });
    return loopIndexes;
  } else {
    return new LoopIndexes({
      parentLoopIndexes: index > 0 ? createLoopIndexes(indexes, index - 1) : undefined,
      value: index > 0 ? value : undefined,
      values: index === 0 ? [value] : undefined
    });
  }
 
}

export function disposeLoopIndexes(loopIndexes: ILoopIndexes, recursive: boolean = true): void {
  const parentLoopIndexes = loopIndexes.parentLoopIndexes;
  if (!loopIndexes.disposed) {
    loopIndexes.dispose();
    loopIndexes.disposed = true;
    _pool.push(loopIndexes as LoopIndexes);
  }
  if (typeof parentLoopIndexes !== "undefined" && recursive) {
    disposeLoopIndexes(parentLoopIndexes);
  }
}