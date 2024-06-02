
export const html = `
<style>
.adult {
  color:red;
}
</style>

{{ loop:members }}
<div data-bind="class.adult:members.*.isAdult">
  {{ members.*.no }} = {{ $1|offset,1 }}:{{ members.*.name }}, {{ members.*.age }}
  <button type="button" data-bind="onclick:popup">popup</button>
</div>
{{ endloop: }}
`;

export class ViewModel {
  members = [
    { name:"佐藤　一郎", age:20 },
    { name:"鈴木　二郎", age:15 },
    { name:"高橋　三郎", age:22 },
    { name:"田中　四郎", age:18 },
    { name:"伊藤　五郎", age:17 },
  ];
  get "members.*.no"() {
    return this.$1 + 1;
  }
  get "members.*.isAdult"() {
    return this["members.*.age"] >= 18;
  }

  popup(e, $1) {
    alert(`選択したのは、${$1 + 1}行目です`);
  }

  $dependentProps = {
    "members.*.isAdult": [ "members.*.age" ]

    // "members.*.no": [ "$1" ], 
    // コンテキスト変数$1に依存するが、コンテキスト変数$1は記述しない
    // →記述するものがない
    // →依存するものがない
    // →省略
  }
}
