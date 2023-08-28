const html = `
<div>
  Page:<select data-bind="value:page">
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
  </select>
</div>
<ul>
  {{ loop:commits }}
  <li>
    {{ commits.*.sha|slice,0,7 }} - {{ commits.*.message }} by {{ commits.*.commit.author.name }}
  </li>
  {{ end: }}
</ul>
`;

class ViewModel {
  page = "3";
  commits = [];

  async getCommits(page) {
    const response = await fetch(`https://api.github.com/repos/mogera551/quel/commits?per_page=${page}&sha=main`);
    return await response.json();
  }
  async $initCallback() {
    this.commits = await this.getCommits(this.page);
  }
  async $writeCallback(name, indexes) {
    if (name === "page") {
      this.commits = await this.getCommits(this.page);
    }
  }
}

export default { html, ViewModel }
