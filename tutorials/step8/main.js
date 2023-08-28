const html = `
<ul>
  {{ loop:commits }}
  <li>
    {{ commits.*.sha|slice,0,7 }} - {{ commits.*.message }} by {{ commits.*.commit.author.name }}
  </li>
  {{ end: }}
</ul>
`;

class ViewModel {
  commits = [];

  async $initCallback() {
    const response = await fetch("https://api.github.com/repos/mogera551/quel/commits?per_page=3&sha=main");
    this.commits = await response.json();
  }
}

export default { html, ViewModel }
