/**
 * example:
 * myapp-components-main-selector
 * 
 * prefix:
 * myapp-components: ./components/{subName}.js
 *  
 * prefix-name: myapp-components
 * prefix_name: myapp_components
 * PrefixName: MyappComponents
 * prefixName: myappComponents
 * prefix.name: myapp.components
 * 
 * sub-name: main-selector
 * sub_name: main_selector
 * SubName: MainSelector
 * subName: mainSelector
 * sub.name: main.selector
 * 
 * load file:
 * import default from ./components/mainSelector.js
 * 
 * example:
 * myapp-components-main-selector
 * 
 * prefix:
 * myapp-components: ./{PrefixName}.js#{subName}
 *  
 * prefix-name: myapp-components
 * prefix_name: myapp_components
 * PrefixName: MyappComponents
 * prefixName: myappComponents
 * prefix.name: myapp.components
 * 
 * sub-name: main-selector
 * sub_name: main_selector
 * SubName: MainSelector
 * subName: mainSelector
 * sub.name: main.selector
 * 
 * load file:
 * import { mainSelector } from ./components/MyappComponents.js
 */
import { PrefixResult } from "../@types/loader";

export class Prefix {
  prefix:string;
  path:string;
  get matchPrefix() {
    return `${this.prefix}-`;
  }
  constructor(prefix:string, path:string) {
    this.prefix = prefix;
    this.path = path;
  }

  isMatch(name:string):boolean {
    return name.startsWith(this.matchPrefix);
  }
  
  getNames(kebabCaseName:string):PrefixResult|undefined {
    const {prefix, path} = this;
    if (kebabCaseName.startsWith(this.matchPrefix)) {
      const subName = kebabCaseName.slice(this.matchPrefix.length);
      return { prefixName:prefix, subName, path };
    }
    return;
  }
}