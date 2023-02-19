import "../types.js";
import BindInfo from "../bindInfo/BindInfo.js";

export default class {
  /**
   * 
   * @param {Node} node
   * @param {ViewModel} viewModel
   * @param {string[]} indexes
   * @returns {BindInfo[]} 
   */
  static bind(node, viewModel, indexes) {
    console.error("need to override");
  }
} 