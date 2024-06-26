

import "../types.js";
import "./types.js";
import { utils } from "../utils.js";
import { getDefaultProperty } from "./defaultProperty.js";
import { getBindText } from "./bindText.js";
import { parse as parseBindText } from "./parseBindText.js"
import { getConstructors } from "./constructors.js";
import { replaceTextNode } from "./replaceTextNode.js";
import { findNodeByNodeRoute, computeNodeRoute } from "./nodeRoute.js";
import { createBinding } from "./createBinding.js";
import { removeAttribute } from "./removeAttribute.js";
import { isInputable } from "./isInputable.js";
import { InitializeNode } from "./InitializeNode.js";
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
      node = replaceTextNode(node, nodeInfo.nodeType); // CommentNodeをTextに置換、template.contentの内容が書き換わることに注意

      removeAttribute(node, nodeInfo.nodeType);
      nodeInfo.isInputable = isInputable(node, nodeInfo.nodeType);
      nodeInfo.defaultProperty = getDefaultProperty(node, nodeInfo.nodeType);
      /** @type {BindTextInfo[]} */
      nodeInfo.bindTextInfos = parseBindText(bindText, nodeInfo.defaultProperty);
      for(let j = 0; j < nodeInfo.bindTextInfos.length; j++) {
        const bindTextInfo = nodeInfo.bindTextInfos[j];
        const { nodeProperty, viewModelProperty } = bindTextInfo;
        bindTextInfo.createBinding = createBinding(bindTextInfo);
        const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, nodeProperty, viewModelProperty, useKeyed);
        bindTextInfo.nodePropertyConstructor = nodePropertyConstructor;
        bindTextInfo.viewModelPropertyConstructor = viewModelPropertyConstructor;
      }
      nodeInfo.nodeRoute = computeNodeRoute(node);
      nodeInfo.nodeRouteKey = nodeInfo.nodeRoute.join(",");
      nodeInfo.initializeNode = InitializeNode(nodeInfo);

      this.nodeInfos[this.nodeInfos.length] = nodeInfo; // push
    }
  }

  /**
   * 
   * @param {DocumentFragment} content
   * @param {BindingManager} bindingManager
   * @returns {Binding[]}
   */
  createBindings(content, bindingManager) {
    const bindings =[];
    for(let i = 0; i < this.nodeInfos.length; i++) {
      const nodeInfo = this.nodeInfos[i];
      const node = findNodeByNodeRoute(content, nodeInfo.nodeRoute);
      const nodeBindings = [];
      for(let j = 0; j < nodeInfo.bindTextInfos.length; j++) {
        nodeBindings[nodeBindings.length] = 
          nodeInfo.bindTextInfos[j].createBinding(bindingManager, node); // push
      }
      nodeInfo.initializeNode(node, nodeBindings);
      bindings.push(...nodeBindings);
    }
    return bindings;
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

