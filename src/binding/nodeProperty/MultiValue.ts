export class MultiValue {
  value:any;
  enabled:boolean = false;
  constructor(value:any, enabled:boolean) {
    this.value = value;
    this.enabled = enabled;
  }
}