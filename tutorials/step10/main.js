const html = `
<div data-bind="message"></div>
<div>
  <input type="text" data-bind="message">
</div>
<div>
  <textarea data-bind="message"></textarea>
</div>
<div>
  <select data-bind="num|number">
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
    <option value="6">6</option>
    <option value="7">7</option>
    <option value="8">8</option>
    <option value="9">9</option>
    <option value="10">10</option>
  </select>
  {{ double }}
</div>
`;

class ViewModel {
  num = 1;
  message = "";
  get double() {
    return this.num + this.num;
  }

  $dependentProps = {
    "double": ["num"]
  }
}

export default { html, ViewModel }
