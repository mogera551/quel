const html = `
<div>
  <div>{{ message }}</div>
  <div data-bind="textContent:message"></div>
  <input type="text" data-bind="value:message">
</div>
<div>
  <select data-bind="value:val">
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
  </select>
  <div>{{ val }}</div>
</div>
`;

class ViewModel {
  message = "welcome to quel";
  val = "1";
}

export default { html, ViewModel }
