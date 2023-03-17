import Filter from "./Filter.js";

export default class {
  /**
   * 
   * @param {string} filterName 
   * @param {string} defaultCustomFilterPath 
   */
  static async load(filterName, defaultCustomFilterPath) {
    let path = defaultCustomFilterPath;
    path += ((path.at(-1) !== "/") ? "/" : "") + filterName + ".js";
    const paths = location.pathname.split("/");
    paths[paths.length - 1] = path;
    const fullPath = location.origin + paths.join("/");
    try {
      const filterModule = await import(/* webpackIgnore: true */fullPath);
      const { output, input } = filterModule.default;
      Filter.regist(filterName, output, input);
    } catch(e) {
      console.log(`can't load filter { filterName:${filterName}, fullPath:${fullPath} }`);
      console.error(e);
    }
  }
}