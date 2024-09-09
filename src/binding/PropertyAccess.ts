import { IPropertyAccess } from "./types";
import { IPropInfo } from "../dotNotation/types";
import { getPropInfo } from "../dotNotation/getPropInfo";

export class PropertyAccess implements IPropertyAccess {
  #pattern: string;
  #indexes: number[];
  #propInfo?: IPropInfo;

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

  constructor(pattern: string, indexes: number[] = []) {
    this.#pattern = pattern;
    this.#indexes = indexes;
  }
}