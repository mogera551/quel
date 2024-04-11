
export const html = `
<button type="button" data-bind="onclick:popup">popup</button>
`;

export class ViewModel {
  popup() {
    alert("popup!!!");
  }
}
