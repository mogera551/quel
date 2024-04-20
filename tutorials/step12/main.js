
export const html = `
<style>
.over {
  color:red;
}
</style>

<input type="number" data-bind="num|number; class.over:isOver">
`;

export class ViewModel {
  num = 5;
  get isOver() {
    return this.num > 10;
  }

  $dependentProps = {
    "isOver": ["num"]
  }
}
