const html = `
<div>{{ message }}</div>
<input type="text" data-bind="value:message">
`;

class ViewModel {
  message = "welcome to quel";
}

export default { html, ViewModel }
