const html = `
<ul>
{{ loop:animals }}
  <li>{{ animals.* }}</li>
{{ end: }}
</ul>
<ul>
{{ loop:fruits }}
  <li>{{ fruits.*.name }}({{ fruits.*.color }})</li>
{{ end: }}
</ul>
`;

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

export default { html, ViewModel }
