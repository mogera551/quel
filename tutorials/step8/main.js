
export const html = `
<ul>
  {{ loop:commits }}
  <li>
    {{ commits.*.sha|slice,0,7 }} - {{ commits.*.message }} by {{ commits.*.commit.author.name }}
  </li>
  {{ end: }}
</ul>
`;

export class ViewModel {
  commits = [];

  async $connectedCallback() {
    const response = await fetch("https://api.github.com/repos/mogera551/quel/commits?per_page=3&sha=main");
    this.commits = await response.json();
  }
}
