const html = `
<style>
  .completed {
    text-decoration: line-through;
  }
</style>
<div>
  <input type="text" data-bind="content">
  <button type="button" data-bind="onclick:add; disabled:content|falsey">追加</button>
</div>
<ul>
  {{ loop:todoItems }}
  <li>
    <input type="checkbox" data-bind="todoItems.*.completed">
    <span data-bind="class.completed:todoItems.*.completed">{{ todoItems.*.content }}</span>
    <button type="button" data-bind="onclick:delete">削除</button>
  </li>
  {{ end: }}
</ul>
`;

class TodoItem {
  content; // ToDoの内容
  completed = false; // 完了フラグ
  constructor(content) {
    this.content = content;
  }
}

class ViewModel {
  content = ""; // 入力欄のテキスト
  todoItems = []; // ToDoリスト、初期値には空の配列をセットする
  add() {
    this.todoItems = this.todoItems.concat(new TodoItem(this.content));
    this.content = "";
  }
  delete(e, $1) {
    this.todoItems = this.todoItems.toSpliced($1, 1);
  }
}

export default { html, ViewModel }
