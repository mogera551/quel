const html = `
<button type="button" data-bind="onclick:popup">popup</button>
`;

class ViewModel {
  popup() {
    alert("popup!!!");
  }
}

export default { html, ViewModel }
