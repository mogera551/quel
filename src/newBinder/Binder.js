

import "../types.js";
import { utils } from "../utils.js";
import { getDefaultProperty } from "./defaultProperty.js";
import { getBindText } from "./bindText.js";
import { parse as bindTextParse } from "./bindTextParser.js"
import { getConstructors } from "./constructors.js";
import { replaceTextNode } from "./replaceTextNode.js";
import { getNodeFromNodeRoute, getNodeRoute } from "./nodeRoute.js";
import { createBinding } from "./factory.js";
import { removeAttribute } from "./removeAttribute.js";
import { isInputable } from "./isInputable.js";
import { nodeInitializer } from "./nodeInitializer.js";
import { getCommentNodes } from "./commentNodes.js";
import { getNodeType } from "./nodeType.js";

const BIND_DATASET = "bind";
const SELECTOR = `[data-${BIND_DATASET}]`;
const UUID_DATASET = "uuid";

const itsSelf = x => x;

export class Binder {
  /** @type {HTMLTemplateElement} */
  template;
  /** @type {string} */
  uuid;

  /** @type {BindNodeInfo[]} */
  nodeInfos = {};

  /**
   * @param {HTMLTemplateElement} template
   * @param {string} uuid
   * @param {boolean} useKeyed
   */
  constructor(template, uuid, useKeyed) {
    this.template = template;
    this.uuid = uuid;
    this.parse(useKeyed);
  }

  /**
   * 
   * @param {boolean} useKeyed 
   */
  parse(useKeyed) {
    const rootElement = this.template.content;
    const nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getCommentNodes(rootElement));
    this.nodeInfos = [];
    for(let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      /** @type {BindNodeInfo} */
      const nodeInfo = { };
      nodeInfo.nodeType = getNodeType(node);
      if (typeof nodeInfo.nodeType === "undefined") utils.raise(`Binder: unknown node type`);
      const bindText = getBindText(node, nodeInfo.nodeType);
      if (bindText.trim() === "") continue;
      node = replaceTextNode(node, nodeInfo.nodeType); // CommentNodeをTextに置換

      removeAttribute(node, nodeInfo.nodeType);
      nodeInfo.isInputable = isInputable(node, nodeInfo.nodeType);
      nodeInfo.defaultProperty = getDefaultProperty(node, nodeInfo.nodeType);
      /** @type {BindTextInfo[]} */
      nodeInfo.bindTextInfos = bindTextParse(bindText, nodeInfo.defaultProperty);
      for(let j = 0; j < nodeInfo.bindTextInfos.length; j++) {
        const bindTextInfo = nodeInfo.bindTextInfos[j];
        const { nodeProperty, viewModelProperty } = bindTextInfo;
        bindTextInfo.bindingCreator = createBinding(bindTextInfo);
        Object.assign(bindTextInfo, getConstructors(node, nodeProperty, viewModelProperty, useKeyed));
      }
      nodeInfo.nodeRoute = getNodeRoute(node);
      nodeInfo.nodeRouteKey = nodeInfo.nodeRoute.join(",");
      nodeInfo.nodeInitializer = nodeInitializer(nodeInfo);

      this.nodeInfos.push(nodeInfo);
    }
  }

  /**
   * 
   * @param {DocumentFragment} content
   * @param {BindingManager} bindingManager
   * @returns {Binding[]}
   */
  createBindings(content, bindingManager) {
    return this.nodeInfos.flatMap(nodeInfo => {
      const node = getNodeFromNodeRoute(content, nodeInfo.nodeRoute);
      const bindings = nodeInfo.bindTextInfos.map(bindTextInfo => bindTextInfo.bindingCreator(bindingManager, node));
      nodeInfo.nodeInitializer(node, bindings);
      return bindings;
    });
  }

  static #binderByUUID = {};
  /**
   * 
   * @param {HTMLTemplateElement} template 
   * @param {boolean} useKeyed
   * @returns {Binder}
   */
  static create(template, useKeyed) {
    const uuid = template.dataset[UUID_DATASET] ?? "";
    return this.#binderByUUID[uuid] ?? (this.#binderByUUID[uuid] = new Binder(template, uuid, useKeyed));
  }
}

