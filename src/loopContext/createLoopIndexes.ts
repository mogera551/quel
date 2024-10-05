import { utils } from "../utils";
import { ILoopIndexes } from "./types";

class LoopIndexes implements ILoopIndexes {
  #parentLoopIndexes: ILoopIndexes | undefined;
  #_values: number[] | undefined;
  #_value: number | undefined;
  #values: number[] | undefined;
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

  add(index: number): ILoopIndexes {
    return new LoopIndexes({ parentLoopIndexes: this, value: index, values: undefined });
  }
}

export function createLoopIndexes(indexes: number[], index = indexes.length - 1): ILoopIndexes {
  const value = indexes[index];
  return new LoopIndexes({
    parentLoopIndexes: index > 0 ? createLoopIndexes(indexes, index - 1) : undefined,
    value: index > 0 ? value : undefined,
    values: index === 0 ? [value] : undefined
  });
}
