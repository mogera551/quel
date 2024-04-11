
export const html = `
<button type="button" data-bind="onclick:change">change!!!</button>
{{ if:val }}
  <div>True</div>
{{ else: }}
  <div>False</div>
{{ end: }}
`;

export class ViewModel {
  val = true;
  change() {
    this.val = !this.val;
  }
}
