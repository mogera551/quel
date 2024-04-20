
export const html = `
<select data-bind="value:display_count">
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
</select>
<ul>
  {{ loop:commits }}
  <li>
    {{ commits.*.sha|slice,0,7 }} - {{ commits.*.commit.message }} by {{ commits.*.commit.author.name }}
  </li>
  {{ end: }}
</ul>
`;

export class ViewModel {
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
      this.commits = await this.getCommits(this.display_count);
    }
  }
}
