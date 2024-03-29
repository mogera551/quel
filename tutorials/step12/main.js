const html = `
<style>
.over {
  color:red;
}
</style>

<input type="number" data-bind="num|number">
<div data-bind="class.over:isOver">{{ num }}</div>
`;

class ViewModel {
  num = 5;
  get isOver() {
    return this.num > 10;
  }

  $dependentProps = {
    "isOver": ["num"]
  }
}

export default { html, ViewModel }
