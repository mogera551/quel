import { TemplateProperty } from "./TemplateProperty";

export class Loop extends TemplateProperty {
  #revisionForLoop = 0;
  get revisionForLoop(): number {
    return this.#revisionForLoop;
  }
  get loopable(): boolean {
    return true;
  }
  dispose() {
    super.dispose();
    this.#revisionForLoop++;
  }
  revisionUpForLoop(): number {
    return ++this.#revisionForLoop;
  }

}