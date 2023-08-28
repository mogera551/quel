const html = `
<ul>
  {{ loop:commits }}
  <li>
    {{ commits.*.sha|slice,0,7 }} - {{ commits.*.message }} by {{ commits.*.commit.author.name }}
  </li>
  {{ end: }}
</ul>
`;

const apiURL = "https://api.github.com/repos/mogera551/quel/commits?per_page=3&sha=main";

class ViewModel {
  commits = [];

  async $initCallback() {
    const response = await fetch(apiURL);
    this.commits = await response.json();
  }
}

export default { html, ViewModel }
