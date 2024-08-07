import { IMultiValue } from "./types";

export class MultiValue implements IMultiValue {
  value:any;
  enabled:boolean = false;
  constructor(value:any, enabled:boolean) {
    this.value = value;
    this.enabled = enabled;
  }
}