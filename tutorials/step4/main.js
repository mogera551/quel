
export const html = `
<div>{{ counter }}</div>
<div>{{ doubled }}</div>
<button type="button" data-bind="onclick:countUp">count up</button>
`;

export class ViewModel {
  counter = 1;
  get doubled() {
    return this.counter * 2;
  }
  countUp() {
    this.counter++;
  }

  $dependentProps = {
    "doubled": [ "counter" ],
  };
}
