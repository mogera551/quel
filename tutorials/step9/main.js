const html = `
<select data-bind="value:per_page">
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
</select>
<ul>
  {{ loop:commits }}
  <li>
    {{ commits.*.sha|slice,0,7 }} - {{ commits.*.message }} by {{ commits.*.commit.author.name }}
  </li>
  {{ end: }}
</ul>
`;

class ViewModel {
  per_page = "3";
  commits = [];

  async getCommits(per_page) {
    const response = await fetch(`https://api.github.com/repos/mogera551/quel/commits?per_page=${per_page}&sha=main`);
    return await response.json();
  }
  async $initCallback() {
    this.commits = await this.getCommits(this.per_page);
  }
  async $writeCallback(name, indexes) {
    if (name === "per_page") {
      this.commits = await this.getCommits(this.per_page);
    }
  }
}

export default { html, ViewModel }
