
export const html = `
<input type="number" data-bind="num|number; style.color:numberColor">
`;

export class ViewModel {
  num = 5;
  get numberColor() {
    return this.num > 10 ? "red" : "black";
  }

  $dependentProps = {
    "numberColor": ["num"]
  }
}

export default { html, ViewModel }
