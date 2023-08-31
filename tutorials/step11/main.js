const html = `
<input type="number" data-bind="num|number">
<div data-bind="style.color:numberColor">{{ num }}</div>
`;

class ViewModel {
  num = 5;
  get numberColor() {
    return this.num > 10 ? "red" : "black";
  }

  $dependentProps = {
    "numberColor": ["num"]
  }
}

export default { html, ViewModel }
