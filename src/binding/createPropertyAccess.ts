import { IPropertyAccess } from "./types";
import { IPropInfo } from "../dotNotation/types";
import { getPropInfo } from "../dotNotation/getPropInfo";

class PropertyAccess implements IPropertyAccess {
  #pattern: string;
  #indexes: number[];
  #propInfo?: IPropInfo;
  #key?: string;

  get pattern(): string {
    return this.#pattern;
  }

  get indexes(): number[] {
    return this.#indexes;
  }

  get propInfo(): IPropInfo {
    if (typeof this.#propInfo === "undefined") {
      this.#propInfo = getPropInfo(this.pattern);
    }
    return this.#propInfo;
  }

  get key(): string {
    if (typeof this.#key === "undefined") {
      this.#key = this.pattern + "\t" + this.indexes.toString();
    }
    return this.#key;
  }

  constructor(pattern: string, indexes: number[]) {
    this.#pattern = pattern;
    this.#indexes = indexes.slice();
  }
}

const _cache: {[key: string]: IPropertyAccess} = {};

export function createPropertyAccess(
  pattern: string, 
  indexes: number[]
) {
  return new PropertyAccess(pattern, indexes);
}