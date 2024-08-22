import { IBinding, IContentBindings } from "./types";

export class ContentBindings implements IContentBindings {
  constructor(
    public template: HTMLTemplateElement,
    public listBinding: IBinding[],
    public parentBinding?: IBinding,
  ) {
  }

  get loopContext() {
    return this.parentBinding?.loopContext;
  }

  get component() {
    return this.parentBinding?.component;
  }
}