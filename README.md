
# What is Quel
Quel is declarative, simple, easy, pure javascript frontend framework.

## Our goal
The development goal is to simplify the increasingly complex frontend development.

## The main features
* Minimal rules and conventions, as intuitive as possible
* Declarative view descriptions
* Support two way binding
* No need for other libraries
* No need for transpiling
* Component-based
* Portability
* Complete separation of CSS, HTML and State
* Compliant with web standards
* **Property description by dot notation**

Simple and declarative view
```html
<div>
  <form data-bind="add|preventDefault">
    <input data-bind="task">
    <button data-bind="disabled:task|falsey">add</button>
  </form>
</div>
<ul>
  {{ loop:taskList }}
  <li data-bind="onclick:select">
    <span data-bind="class.selected:taskList.*.selected">{{ taskList.* }}</span>, 
    <button data-bind="delete">X</button>
  </li>
  {{ endloop: }}
</ul>
```

Simple class to store and manipulate state
```js
class ViewModel {
  /** @type {string} */
  task = "";
  /** @type {string[]} */
  taskList = [];
  /** @type {number} */
  selectedIndex;
  /** @type {boolean} */
  get "taskList.*.selected"() {
    return this.selectedIndex === this.$1;
  }

  /**
   * add task to list
   */
  add() {
    this.taskList = this.taskList.concat(this.task);
    this.task = "";
  }

  /**
   * delete task from list
   * @param {Event} e
   * @param {number} $1 loop context index
   */
  delete(e, $1) {
    this.taskList = this.taskList.toSpliced($1, 1);
    this.selectedIndex = undefined;
  }

  /**
   * select task
   * @param {Event} e
   * @param {number} $1 loop context index
   */
  select(e, $1) {
    this.selectedIndex = $1;
  }

  /** @type {{string,string[]}} special property, describe dependent properties */
  $dependentProps = {
    "taskList.*.selected": [ "selectedIndex" ],
  }
}
```

See [todo list sample](https://codepen.io/mogera551/pen/MWRGNBr)

## Getting Start
To use Quel, import the necessary functions from the CDN or the downloaded file using the import declaration.
* An `import` declaration is required, so the `script` tag needs `type="module"`.

Example for CDN
```html
<script type="module">
import { registerComponentModules } from "https://cdn.jsdelivr.net/gh/mogera551/quel@latest/dist/quel.min.js"; // CDN
</script>
```

Example for downloaded file
```html
<script type="module">
import { registerComponentModules } from "./path/to/quel.min.js"; // path to downloaded file
</script>
```

### Install Test
Display `Welcome to Quel`.

```html
<!DOCTYPE html>
<html lang="ja">
<meta charset="utf-8">

<myapp-main></myapp-main>

<script type="module">
import { registerComponentModules } from "https://cdn.jsdelivr.net/gh/mogera551/quel@latest/dist/quel.min.js"; // CDN

const html = `
<div>{{ message }}</div>
`;

class ViewModel {
  message = "Welcome to Quel";
}

registerComponentModules({ myappMain:{ html, ViewModel } });
</script>
</html>
```

## The development flow
In component-based development, you will proceed with the following steps:
* Write custom elements in HTML
* Create corresponding component modules
   * Define the HTML template
   * Define the class to store and manipulate state
* Associate custom elements with component modules

### Write custom elements in HTML
You can use autonomous custom elements and customized built-in elements for custom elements. 
The custom element name must include a dash `-`.

Example for custom elements
`index.html`
```html
<!DOCTYPE html>
<html lang="ja">
<meta charset="utf-8">

<!-- autonomous custom element -->
<myapp-main><myapp-main>

<!-- customized built-in element -->
<div is="myapp-main"></div>

</html>
```

### Create corresponding component modules
A component module consists of an HTML template, and a class that stores and manipulates state.
It is easier to manage if one component module is described in one file.
Here, it is referred to as `main.js`.

#### Define the HTML template.
Define the HTML that will serve as the content of the component.
You describe the embedding of properties defined in the `ViewModel` class, the association of attribute values of html elements, the association of events, conditional branching, and repetition.
Declare with the variable name `html` and `export` it.

Example for HTML template of component module
`main.js`
```js
export const html = `
<!-- embed -->
<div>{{ count }}</div>

<!-- association of attribute -->
<input data-bind="value:message">

<!-- association of events -->
<button data-bind="onclick:countUp">count up</button>

<!-- conditional branching -->
{{ if:is5Times }}
  <div>It has been pressed more than 5 times.</div>
{{ endif: }}

<!-- repetition -->
<ul>
  {{ loop:animals }}
    <li>{{ animals.* }}</li>
  {{ endloop: }}
</ul>
`;
```

#### Define the class to store and manipulate state
Define the ViewModel class that stores and manipulates the state of the component.
By declaring members that store state as fields within the class, you can handle the state as properties of the class.
Create methods within the class to manipulate the state.
Declare with the class name `ViewModel` and `export` it.
You can also use accessor properties using getters.
note:When using accessor properties, it is necessary to define dependencies.

Example for ViewModel class of component module
`main.js`
```js
export class ViewModel {
  // state
  count = 0;
  message = "welcome to quel";
  animals = [ "cat", "dog", "fox", "pig" ];

  // accessor properties using getters
  get is5Times() {
    return this.count >= 5;
  }

  // manipulate the state
  countUp() {
    this.count++;
  }

  // define dependencies
  // when using accessor properties
  $dependentProps = {
    "is5Times": [ "count" ],
  }
}
```

### Associate custom elements with component modules
You `import` the created component module.
You associate the component module with the custom element name using the registerComponentModules function.

`index.html`
```js
import { registerComponentModules } from "https://cdn.jsdelivr.net/gh/mogera551/quel@latest/dist/quel.min.js"; // CDN
import * as myappMain from "./main.js"; // import the created component module

// Associate the component module with the custom element name
registerComponentModules({ "myapp-main":myappMain });

// The custom element name can also be in camel case
registerComponentModules({ "myappMain":myappMain });

// You can describe it more simply using the shorthand notation for object literals
registerComponentModules({ myappMain });
```

## Tutorial
### First
The file structure used in the tutorial is as follows.
```
--+-- index.html
  |
  +-- main.js
```

In `index.html`
* Describe the custom element (<myapp-main/>)
* Import `registerComponentModules` function
* Import `main` component module
* associate the component module with the custom element name using the `registerComponentModules` function

Unless otherwise stated, the tutorial will use the contents of the following index.html.

`index.html`
```html
<!DOCTYPE html>
<html lang="ja">
<meta charset="utf-8">

<myapp-main></myapp-main>

<script type="module">
import { registerComponentModules } from "https://cdn.jsdelivr.net/gh/mogera551/quel@latest/dist/quel.min.js"; // CDN
import * as myappMain from "./main.js";

registerComponentModules({ myappMain });
</script>
</html>
```

In `main.js`,
* You define the HTML template in the `html` variable, `export` it
* In the `ViewModel` class, you define a class that stores and manipulates state, `export` it.

In the tutorial, we will mainly discuss `main.js`.

`main.js`
```js
export const html = `
(HTML Tempate)
`;

export class ViewModel {
  // (State)

  // (Manupilate)

}
```

### Step 1. Embedding properties
* In `html`, enclose the property `message` to be embedded in `{{ }}`.
* In `ViewModel`, declare the property `message` that stores the state as a field, and give it an initial value of `welcome to quel`.
* The `ViewModel` class is extended by a Proxy after it is instantiated, so you cannot use private fields in the ViewModel class.
* Property names starting with `$` are assigned to special properties, so you cannot use them.

The content of the `html` variable in `main.js`
```html
<div>{{ message }}</div>
```

The `ViewModel` class in `main.js`
```js
export class ViewModel {
  message = "welcome to quel";
  // #message NG, cannot use private fields
  // $message NG, cannot use name starting with $ 
}
```

See [result](https://codepen.io/mogera551/pen/KKrbPjJ).

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step1).

### Step 2. Property Binding
* Associate the properties of the html elements in template with the properties of the `ViewModel` class.
* Specify (element property name):(ViewModel class property name) in the data-bind attribute of the element.
`textContent:message`,`value:message`,`value:season`...
* If you specify multiple bindings, separate them with a semicolon `;`.
`disabled:buttonDisable; textContent:season;`
* When a property of the `ViewModel` class is updated, the update is automatically reflected in the property of the html element.
* For input elements, the property of the ViewModel class is updated according to the input value. (See bidirectional binding)

The content of the `html` variable in `main.js`
```html
<div>
  <div>{{ message }}</div>
  <!-- bind ViewModel.message to div.textContent -->
  <div data-bind="textContent:message"></div>
  <!-- input element, bind ViewModel.message to input.value -->
  <input type="text" data-bind="value:message">
</div>
<div>
  <div>{{ season }}</div>
  <!-- input element, bind ViewModel.season to select.value -->
  <select data-bind="value:season">
    <option value="spring">spring</option>
    <option value="summer">summer</option>
    <option value="autumn">autumn</option>
    <option value="winter">winter</option>
  </select>
</div>
<div>
  <!-- bind ViewModel.buttonDisable to button.disabled -->
  <!-- bind ViewModel.season to button.textContent -->
  <button data-bind="disabled:buttonDisable; textContent:season;"></button>
  <label>
    <!-- input element, bind ViewModel.buttonDisable to input.checked -->
    <input type="checkbox" data-bind="checked:buttonDisable">
    button disable
  </label>
</div>
```

The `ViewModel` class in `main.js`
```js
export class ViewModel {
  message = "welcome to quel";
  season = "spring";
  buttonDisable = false;
}
```

See [result](https://codepen.io/mogera551/pen/QWzWPzg).

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step2).

### Step 3. Event Binding
* Associate the event properties (`on~`) of the html elements with the methods of the `ViewModel` class.
* Specify `(element event property name):(ViewModel class method name)` in the `data-bind` attribute of the element. ->`onclick:popup`
* The methods of the `ViewModel` class take an Event object as an argument. ->`checked(e)`

Content of the `html` variable in `main.js`
```html
<button type="button" data-bind="onclick:popup">click here</button>
<label>
  <input type="checkbox" data-bind="onclick:checked">checked
</label>
```

`ViewModel` class in `main.js`
```js
export class ViewModel {
  popup() {
    alert("popup!!!");
  }

  /**
   * @param {Event} e Event object
   */
  checked(e) {
    alert(`checked ${e.target.checked ? "on" : "off"}`);
  }
}
```

See [result](https://codepen.io/mogera551/pen/ZEVYWER).

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step3).

### Step 4. Accessor Properties
* You can also embed and bind accessor properties using `get`.
* When using accessor properties, you need to describe the dependencies in the `$dependentProps` of the `ViewModel` class.
* Dependencies are described as `(accessor property name):(enumeration of referenced properties)`.
  `"doubled": [ "counter" ]`, `"is5times": [ "counter" ]`
* If you do not describe the dependencies, the html elements will not be updated.

Content of the `html` variable in `main.js`
```html
<div>{{ counter }}</div>
<div>{{ doubled }}</div>
<!-- Disable the button after 5 presses -->
<button type="button" data-bind="onclick:countUp; disabled:over5times;">count up</button>
```

`ViewModel` class in `main.js`
```js
class ViewModel {
  counter = 1;

  // Accessor property
  /**
   * Doubles the value of counter.
   * @type {number}
   */
  get doubled() {
    return this.counter * 2;
  }
  /**
   * Returns true if the value of counter is 5 or more.
   * @type {boolean}
   */
  get over5times() {
    return this.counter >= 5;
  }

  /**
   * Increment count
   */
  countUp() {
    this.counter++;
  }

  // dependencies
  $dependentProps = {
    // (accessor property name):(enumeration of referenced properties)
    "doubled": [ "counter" ],
    "is5times": [ "counter" ],
  };
}
```

See [result](https://codepen.io/mogera551/pen/abPzKwx).

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step4).

### Step 5. Output Filters 
* You can use output filters on the properties of `ViewModel`.
* Write the pipe `|` and the filter name after the property in html.
* You can specify options after the filter name, separated by a comma `,`.
* You can specify multiple filters using the pipe `|`.
* Filters are provided as immutable methods of `String`, `Number`, and `Array`.

In terms of processing properties, it is similar to accessor properties, but differs in the following points.

Features of filters (differences from accessor properties)
* There is no need to write dependencies. (You don't need to write $dependentProps.)
* Only the output of a single property can be filtered. Filters cannot handle multiple properties.

#### List of Built-in Filter

|Name|Options|Type|Memo|
|----|----|----|----|
|truthy|||prop ? true : false|
|falsey|||!prop ? true : false|
|not|||!prop ? true : false|
|eq|[any]||prop == [any]|
|ne|[any]||prop != [any]|
|lt|[number]||prop < [number]|
|le|[number]||prop <= [number]|
|gt|[number]||prop > [number]|
|ge|[number]||prop >= [number]|
|embed|[format]||like printf, replace %s to prop|
|iftext|[string1][string2]||prop is true then [string1] else [string2]|
|isnull|||prop == null|
|offset|[number]||prop + [number]|
|unit|[string]||prop + [string]|
|inc|[number]||prop + [number]|
|mul|[number]||prop * [number]|
|div|[number]||prop / [number]|
|mod|[number]||prop % [number]|
|at|...|string||
|charAt|...|string||
|charCodeAt|...|string||
|codePointAt|...|string||
|concat|...|string||
|endsWith|...|string||
|includes|...|string||
|indexOf|...|string||
|lastIndexOf|...|string||
|localCompare|...|string||
|match|...|string||
|normalize|...|string||
|padEnd|...|string||
|padStart|...|string||
|repeat|...|string||
|replace|...|string||
|replaceAll|...|string||
|search|...|string||
|s.slice|...|string||
|split|...|string||
|startsWith|...|string||
|substring|...|string||
|toLocaleLowerCase|...|string||
|toLocaleUpperCase|...|string||
|toLowerCase|...|string||
|toUpperCase|...|string||
|trim|...|string||
|trimEnd|...|string||
|trimStart|...|string||
|toExponential|...|number||
|toFixed|...|number||
|toLocaleString|...|number||
|toPrecision|...|number||
|at|...|Array||
|concat|...|Array||
|entries|...|Array||
|flat|...|Array||
|includes|...|Array||
|indexOf|...|Array||
|join|...|Array||
|keys|...|Array||
|lastIndexOf|...|Array||
|a.slice|...|Array||
|toLocaleString|...|Array||
|toReversed|...|Array||
|toSorted|...|Array||
|toSpliced|...|Array||
|values|...|Array||
|with|...|Array||

Content of the `html` variable in `main.js`
```html
<div>{{ message }}</div>
<div>{{ message|substring,4,15|toUpperCase }}<!-- QUICK BROWN --></div>

<div>{{ price }}</div>
<div>{{ price|toLocaleString }}<!-- 19,800 --></div>
```

`ViewModel` class in `main.js`
```js
class ViewModel {
  message = "The quick brown fox jumps over the lazy dog";
  price = 19800;
}
```

See [result](https://codepen.io/mogera551/pen/rNoVevQ).

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step5).

### Step 6. Conditional Branch Block
* You can control the display using the properties of `ViewModel` as conditions.
* Enclose the block to be controlled (a set of elements) with `{{ if:(ViewModel property) }} ... {{ endif: }}`. -> `{{ if:val }} ... {{ endif: }}`
* Use `{{ else: }}` to display false conditions.
* There is no `else if`.
* A single property is used as a condition. -> Conditions cannot handle multiple properties.

Content of the `html` variable in `main.js`
```html
<button type="button" data-bind="onclick:change">change!!!</button>
{{ if:val }}
  <div>val is true</div>
{{ else: }}
  <div>val is false</div>
{{ endif: }}
```

`ViewModel` class in `main.js`
```js
class ViewModel {
  val = true;
  change() {
    this.val = !this.val;
  }
}
```

See [result](https://codepen.io/mogera551/pen/xxmGadX).

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step6).

### Step 7. Loop Block
* You can repeat the display block using the array properties of `ViewModel`.
* Enclose the block to be repeated (a set of elements) with `{{ loop:(ViewModel property) }} ... {{ endloop: }}` in html.
   * `{{ loop:animals }} ... {{ endloop: }}`
   * `{{ loop:fruits }} ... {{ endloop: }}`
* Within the repeating block, describe the array elements using dot notation with wildcard `*`.
   * `animals.*`
   * `fruits.*.name`
   * `fruits.*.age`

Content of the `html` variable in `main.js`
```html
<ul>
{{ loop:animals }}
  <li>{{ animals.* }}</li>
{{ endloop: }}
</ul>
<ul>
{{ loop:fruits }}
  <li>{{ fruits.*.name }}({{ fruits.*.color }})</li>
{{ endloop: }}
</ul>
```

`ViewModel` class in `main.js`
```js
class ViewModel {
  animals = [ "cat", "dog", "fox", "pig" ];
  fruits = [
    { name:"apple", color:"red" },
    { name:"banana", color:"yellow" },
    { name:"grape", color:"grape" },
    { name:"orange", color:"orange" },
    { name:"strawberry", color:"red" },
  ];
}
```

See [result](https://codepen.io/mogera551/pen/eYbpzMw)

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step7).

### Step 8. Initialization Event Handler
* You can set the callback method `$connectedCallback`, which is an initialization event handler, in the `ViewModel` class.
* The initialization event occurs when a component is created.
* You can specify `async` for the callback method.
* The callback method does not have any arguments.
* In the sample, it fetches repository information from GitHub's API.

Content of the `html` variable in `main.js`
```html
<ul>
  {{ loop:commits }}
  <li>
    {{ commits.*.sha|s.slice,0,7 }} - {{ commits.*.commit.message }} by {{ commits.*.commit.author.name }}
  </li>
  {{ endloop: }}
</ul>
```

`ViewModel` class in `main.js`
```js
class ViewModel {
  commits = [];
  async $connectedCallback() {
    const response = await fetch("https://api.github.com/repos/mogera551/quel/commits?per_page=3&sha=main");
    this.commits = await response.json();
  }
}
```

See [result](https://codepen.io/mogera551/pen/vYvLQVX)

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step8).

### Step 9. Write Event Handler
* You can set the callback method `$writeCallback`, which is a write event handler, in the `ViewModel` class.
* The write event occurs when there is a write to the properties of `ViewModel`.
* You can specify `async` for the callback method.
* The arguments of the callback method are the written property name and the loop index array.
* Normally, `ViewModel` properties associated with input DOMs are automatically updated, but this is used when you want to do some other processing after updating.
* In the sample, it fetches repository information from GitHub's API.

Content of the `html` variable in `main.js`
```html
display 
<select data-bind="value:display_count">
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
</select> items.
<ul>
  {{ loop:commits }}
  <li>
    {{ commits.*.sha|s.slice,0,7 }} - {{ commits.*.commit.message }} by {{ commits.*.commit.author.name }}
  </li>
  {{ endloop: }}
</ul>
```

`ViewModel` class in `main.js`
```js
class ViewModel {
  display_count = "3";
  commits = [];
  async getCommits(per_page) {
    const response = await fetch(`https://api.github.com/repos/mogera551/quel/commits?per_page=${per_page}&sha=main`);
    return await response.json();
  }
  async $connectedCallback() {
    this.commits = await this.getCommits(this.display_count);
  }
  async $writeCallback(name, indexes) {
    if (name === "display_count") {
      // when changed display_count property
      this.commits = await this.getCommits(this.display_count);
    }
  }
}
```

See [result](https://codepen.io/mogera551/pen/rNoxQEE)

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step9).

### Step 10. Default Properties & Two-Way Binding
* The properties of the html elements in the table below can be set as default properties, allowing you to omit the specification of the properties of the html elements when binding.
   * `data-bind="value:message"`->`data-bind="message"`
   * `data-bind="textContent:message"`->`data-bind="message"` 

|Tag|Type Attribute|Property|
|----|----|----|
|input|radio|checked|
|input|checkbox|checked|
|input|other than above|value|
|select||value|
|textarea||value|
|button||onclick|
|a||onclick|
|form||onsubmit|
|other than above||textContent|

* When binding the default properties of html input elements and the properties of the `ViewModel` class, if the properties of the input HTML elements are updated, the properties of the `ViewModel` class are also automatically updated (two-way binding).
* The target input elements are `input`, `select`, `textarea`.
* In the case of two-way binding, do not specify a filter for output. If necessary, specify the input filter `number` for type conversion. `data-bind="num|number"`
* The method of specifying the input filter is the same as the normal filter.

Content of the `html` variable in `main.js`
```html
<div data-bind="message"></div>
<div>
  <input type="text" data-bind="message">
</div>
<div>
  <textarea data-bind="message"></textarea>
</div>
<div>
  <button type="button" data-bind="clearMessage">clear message</button>
</div>
<div>
  <select data-bind="num|number">
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
    <option value="6">6</option>
    <option value="7">7</option>
    <option value="8">8</option>
    <option value="9">9</option>
    <option value="10">10</option>
  </select>
  {{ double }}
</div>
```

`ViewModel` class in `main.js`
```js
class ViewModel {
  num = 1;
  message = "";
  get double() {
    return this.num + this.num;
  }
  clearMessage() {
    this.message = "";
  }
  $dependentProps = {
    "double": ["num"]
  }
}
```

See [result](https://codepen.io/mogera551/pen/ZEVWeEP)

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step10).

### Step 11. Binding Styles
* When binding the style attribute of an html element and a property of the `ViewModel` class, write it as style.`(style attribute of the element):(property of ViewModel)`. For example, `style.color:numberColor`.

Content of the `html` variable in `main.js`
```html
<input type="number" data-bind="num|number; style.color:numberColor">
```

`ViewModel` class in `main.js`
```js
class ViewModel {
  num = 5;
  get numberColor() {
    return this.num > 10 ? "red" : "black";
  }
  $dependentProps = {
    "numberColor": ["num"]
  }
}
```

See [result](https://codepen.io/mogera551/pen/mdaEmJx)

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step11).

### Step 12. Binding Classes
* When binding the class attribute of an html element and a property of the `ViewModel` class, write it as class.`(class name):(property of ViewModel)`. For example, `class.over:isOver`.
* If the property of the `ViewModel` class is true, the class name is added to the class attribute of the element.
* If the property of the `ViewModel` class is false, the class name is removed from the class attribute of the element.

Content of the `html` variable in `main.js`
```html
<style>
.over {
  color:red;
}
</style>
<input type="number" data-bind="num|number; class.over:isOver">
```

`ViewModel` class in `main.js`
```js
class ViewModel {
  num = 5;
  get isOver() {
    return this.num > 10;
  }
  $dependentProps = {
    "isOver": ["num"]
  }
}
```

See [result](https://codepen.io/mogera551/pen/LYMZypL)

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step12).

### Step 13. Using context variables and wildcards in repeat blocks
* You can declare accessor properties using wildcards within repeat blocks. ex. `members.*.no`, `members.*.isAdult`
* You can access properties using wildcards within accessor properties that use wildcards in repeat blocks. ex. The part where `members.*.age` is referenced within `members.*.isAdult`.
* You can use context variables (index values) in accessor properties that use wildcards in repeat blocks.
  * The context variable `this.$1` is referenced within the property.
* You can use index values in event handlers within repeat blocks.
  * The index value is passed as the second argument to the event handler. ex. `$1` in `popup(e, $1)`
* You can directly use context variables (index values) within repeat blocks. ex. `$1|offset,1`

Content of the `html` variable in `main.js`
```html
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
```

`ViewModel` class in `main.js`
```js
class ViewModel {
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
  }
}
```

See [result](https://codepen.io/mogera551/pen/rNoLQWY)

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step13).

### Step 14. Manipulating array properties
* When updating (adding, deleting, sorting) the array properties of `ViewModel`, create a new array with an immutable method and assign it. `concat method` of `add()`
* When updating the elements of the array properties of ViewModel, you can update using a wildcard. `<input type="text" data-bind="fruits.*">`
* The reflection to html is done automatically.

Content of the `html` variable in `main.js`
```html
<button type="button" data-bind="onclick:add">add grape</button>
<button type="button" data-bind="onclick:dump">dump fruits</button>
{{ loop:fruits }}
<div><input type="text" data-bind="fruits.*">{{ fruits.* }}</div>
{{ endloop: }}
```

`ViewModel` class in `main.js`
```js
class ViewModel {
  fruits = ["apple", "orange", "strawberry"];
  add() {
    // Add elements with an immutable concat and assign to the fruits property.
    // Do not use mutable `push`.
    this.fruits = this.fruits.concat("grape");
  }
  dump() {
    alert(JSON.stringify(this.fruits));
  }
}
```

See [result](https://codepen.io/mogera551/pen/yLGaNOm)

See [source](https://github.com/mogera551/quel/tree/main/tutorials/step14).

### Step.15 ToDoリストを作ってみよう
#### 仕様
* チュートリアルの`index.html`を使用する
* 入力部分
   * 入力欄と追加ボタンを用意する
   * 追加ボタンを押すと入力欄の内容をToDoリストに追加し、入力欄をクリア
   * 入力欄に入力がない場合追加ボタンは非活性化`disabled`
* リスト部分
   * `<ul>`でリスト表示する
   * リスト要素毎に、チェックボックス、ToDoの内容、削除ボタンを表示
   * チェックボックスをチェックすると、ToDoの内容を打消し線で装飾
   * 打消し線はクラス属性(`completed`)で実現
   * 削除ボタンを押すと当該行のToDoをリストから削除する
#### `html`のモック
```html
<style>
.completed {
  text-decoration: line-through;
}
</style>
<!-- 入力部分 -->
<div>
  <form data-bind="add">
    <input type="text">
    <button>追加</button>
  </form>
</div>
<!-- リスト部分 -->
<ul>
  <li>
    <input type="checkbox">
    <span>ToDoの内容</span>
    <button type="button">削除</button>
  </li>
  <li>
    <input type="checkbox" checked>
    <span class="completed">ToDoの内容</span>
    <button type="button">削除</button>
  </li>
</ul>
```

[モックを見る](https://codepen.io/mogera551/pen/LYMRWVK)

#### ToDo情報を格納するオブジェクトの型定義
* ToDoの内容`content`
* 完了フラグ`completed`
```js
/**
 * @typedef {Object} TodoItem
 * @property {string} content
 * @property {boolean} completed
 */
```

#### ViewModelクラスで保持する情報
* 入力欄のテキスト`content`
* ToDoリスト(TodoItemのリスト)`todoItems`
   * 配列を保持する場合、初期値として空の配列を入れる
```js
class ViewModel {
  /** @type {string} input text */
  content = "";
  /** @type {TodoItem[]} todo list, set empty array as initial value */
  todoItems = [];
}
```

#### htmlの入力部分
* モックの入力部分を元にして作成
* 入力欄と`ViewModel`クラスの`content`をバインド。`data-bind="content"`
* `submit`時、`ViewModel`クラスの`add`メソッドを呼び出す。呼び出し時、`preventDefault`フィルタで、`event.preventDefault()`を実行する。`data-bind="add|preventDefault"`
* 入力欄に入力がない場合追加ボタンは非活性化。`data-bind="disabled:content|falsey"`
   * 追加ボタンの`disabled`プロパティと`ViewModel`クラスの`content|falsey`をバインド
   * `content|falsey`は、`!content`と同じ意味
```html
<div>
  <form data-bind="add|preventDefault">
    <input data-bind="content">
    <button data-bind="disabled:content|falsey">追加</button>
  </form>
</div>
```

#### ViewModelのaddメソッド
* 入力欄のテキストからToDoリストの要素を生成し、ToDoリストに追加し、ToDoリストを更新
   * ミュータブルな`push`ではなく`concat`を使う
* 追加後、入力欄のテキストをクリア`this.content = ""`
```js
class ViewModel {
  /**
   * add todo item
   */
  add() {
    const { content } = this;
    this.todoItems = this.todoItems.concat({ content, completed:false });
    this.content = "";
  }
}
```

#### htmlのリスト部分
* モックのリスト部分を元にして作成
* ToDoリストの繰り返すブロックを`{{ loop: }} ～ {{ endloop: }}`で括る
* チェックボックスのチェック状態とToDoの完了フラグをバインドする。`data-bind="todoItems.*.completed"`
* ToDoの内容の表示`{{ todoItems.*.content }}`
* ToDoの完了フラグの状態によりクラス属性にcompletedを追加、削除する。`data-bind="class.completed:todoItems.*.completed"`
* 削除ボタンを押すと`ViewModel`クラスの`delete`メソッドを呼び出す。`data-bind="delete"`
```html
<ul>
  {{ loop:todoItems }}
  <li>
    <input type="checkbox" data-bind="todoItems.*.completed">
    <span data-bind="class.completed:todoItems.*.completed">{{ todoItems.*.content }}</span>
    <button type="button" data-bind="delete">削除</button>
  </li>
  {{ endloop: }}
</ul>
```

#### ViewModelのdeleteメソッド
* `delete`メソッドは、繰り返しブロック内にあるため、第2引数にインデックスが渡る
* ToDoリストからインデックスの指す要素を削除し、ToDoリストに代入する。
   * ミュータブルな`splice`ではなく`toSpliced`を使う
```js
class ViewModel {
  /**
   * delete todo item
   * @param {Event} e
   * @param {number} $1 loop context index
   */
  delete(e, $1) {
    this.todoItems = this.todoItems.toSpliced($1, 1);
  }
}
```

#### 完成
`main.js`
```js
const html = `
<style>
  .completed {
    text-decoration: line-through;
  }
</style>
<div>
  <form data-bind="add|preventDefault">
    <input data-bind="content">
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
  {{ endloop: }}
</ul>
`;

/**
 * @typedef {Object} TodoItem
 * @property {string} content
 * @property {boolean} completed;
 */

class ViewModel {
  /** @type {string} input text */
  content = "";
  /** @type {TodoItem[]} todo list, initial value empty array */
  todoItems = [];
  /**
   * add todo item
   */
  add() {
    this.todoItems = this.todoItems.concat({content:this.content, completed:false}));
    this.content = "";
  }
  /**
   * delete todo item
   * @param {Event} e
   * @param {number} $1 loop index
   */
  delete(e, $1) {
    this.todoItems = this.todoItems.toSpliced($1, 1);
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/JjwRWYV)

### memo

install @rollup/plugin-terser

```
npm install @rollup/plugin-terser --save-dev
```

bundle

```
npx rollup -c
npx rollup -c rollup-dev.config.js
```

tag
```
git tag v0.9.28 
git push origin --tags
```
