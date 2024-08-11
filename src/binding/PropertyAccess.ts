import { getPatternNameInfo } from "../dot-notation/PatternName";
import { IPatternNameInfo } from "../@types/dotNotation";
import { IPropertyAccess } from "../@types/binding";

export class PropertyAccess implements IPropertyAccess {
  patternName:string;
  indexes:number[];
  #patternNameInfo:IPatternNameInfo|undefined;
  get patternNameInfo():IPatternNameInfo {
    if (typeof this.#patternNameInfo === "undefined") {
      this.#patternNameInfo = getPatternNameInfo(this.patternName);
    }
    return this.#patternNameInfo;
  }

  constructor(patternName:string, indexes:number[] = []) {
    this.patternName = patternName;
    this.indexes = indexes;
  }
}