
export const html = `
<button type="button" data-bind="onclick:add">add grape</button>
<button type="button" data-bind="onclick:dump">dump fruits</button>
{{ loop:fruits }}
<div><input type="text" data-bind="fruits.*">{{ fruits.* }}</div>
{{ end: }}
`;

export class ViewModel {
  fruits = ["apple", "orange", "strawberry"];
  add() {
    // 
    // イミュータブルなconcatで要素を追加して、fruitsプロパティへ代入
    // ミュータブルなpushは使わない
    this.fruits = this.fruits.concat("grape");
  }
  dump() {
    alert(JSON.stringify(this.fruits));
  }
}
