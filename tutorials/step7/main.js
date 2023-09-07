const html = `
<ul>
{{ loop:animals }}
  <li>{{ animals.* }}</li>
{{ end: }}
</ul>
<ul>
{{ loop:members }}
  <li>{{ members.*.name }}({{ members.*.age }})</li>
{{ end: }}
</ul>
`;

class ViewModel {
  animals = [ "cat", "dog", "fox", "pig" ];
  members = [
    { name:"佐藤　一郎", age:20 },
    { name:"鈴木　二郎", age:15 },
    { name:"高橋　三郎", age:22 },
    { name:"田中　四郎", age:18 },
    { name:"伊藤　五郎", age:17 },
  ];
}

export default { html, ViewModel }
