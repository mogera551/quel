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
    this.prefixes.push(Object.assign(new Prefix, {prefix, path}));
  }

  /**
   * 
   * @param {string} tagName 
   * @returns {{prefix:string,path:string}}
   */
  static getByTagName(tagName) {
    const prefix = this.prefixes.find(prefix => {
      const match = prefix.prefix + "-";
      return tagName.startsWith(match);
    });
    return prefix;
  }
}

