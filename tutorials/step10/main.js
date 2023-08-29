const html = `
<div data-bind="text"></div>
<input type="text" data-bind="text">
<textarea data-bind="text"></textarea>
<select data-bind="num|number">
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
</select>
<div>{{ double }}</div>
`;

class ViewModel {
  num = 1;
  text = "";
  get double() {
    return this.num + this.num;
  }

  $dependentProps = {
    "double": ["num"]
  }
}

export default { html, ViewModel }
