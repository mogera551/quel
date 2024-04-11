
export const html = `
<style>
  .completed {
    text-decoration: line-through;
    color: grey;
  }
</style>
<div>
  <form data-bind="add">
    <input type="text" data-bind="content">
    <button data-bind="disabled:content|falsey">追加</button>
  </form>
</div>
<ul>
  {{ loop:todoItems }}
  <li>
    <input type="checkbox" data-bind="todoItems.*.completed">
    <span data-bind="class.completed:todoItems.*.completed">{{ todoItems.*.content }}</span>
    <button type="button" data-bind="delete">削除</button>
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

export class ViewModel {
  content = ""; // 入力欄のテキスト
  todoItems = []; // ToDoリスト、初期値には空の配列をセットする
  add(e) {
    e.preventDefault();
    this.todoItems = this.todoItems.concat(new TodoItem(this.content));
    this.content = "";
  }
  delete(e, $1) {
    this.todoItems = this.todoItems.toSpliced($1, 1);
  }
}
