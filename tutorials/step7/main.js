const html = `
<ul>
{{ loop:list }}
  <li>{{ list.* }}</li>
{{ end: }}
</ul>
`;

class ViewModel {
  list = [ "cat", "dog", "fox", "pig" ];
}

export default { html, ViewModel }
