import { TemplateProperty } from "./TemplateProperty";

export class Loop extends TemplateProperty {
  _revisionForLoop = 0;
  get revisionForLoop(): number {
    return this._revisionForLoop;
  }
  get loopable(): boolean {
    return true;
  }
  dispose() {
    super.dispose();
    this._revisionForLoop++;
  }
}