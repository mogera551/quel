import { IPropsBindingInfo } from "./types";

class PropsBindingInfo implements IPropsBindingInfo {
  parentProp: string;
  thisProp: string;
  get key() {
    return `${this.parentProp}:${this.thisProp}`;
  }
  constructor(parentProp: string, thisProp: string) {
    this.parentProp = parentProp;
    this.thisProp = thisProp;
  }
}

export function createPropsBindingInfo(parentProp:string, thisProp:string): PropsBindingInfo {
  return new PropsBindingInfo(parentProp, thisProp);
}