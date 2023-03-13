export default class Prefix {
  /**
   * @type {string}
   */
  prefix;
  /**
   * @type {string}
   */
  path;

  static prefixes = [];
  static add(prefix, path) {
    this.prefixes.push(new Prefix, {prefix, path});
  }

  static getByTagName(tagName) {
    const prefix = this.prefixes.find(prefix => {
      const match = prefix.prefix + "-";
      return tagName.startsWith(match);
    });
    return prefix;
  }
}

