/**
 * @typedef {import("../modules/dot-notation/dot-notation.js").PropertyName} PropertyName
 */

/**
 * @typedef {import("../modules/dot-notation/dot-notation.js").PropertyAccess} PropertyAccess 
 */

/**
 * @typedef {Object} ViewModel
 * @property {number|undefined} $1
 * @property {number|undefined} $2
 * @property {number|undefined} $3
 * @property {number|undefined} $4
 * @property {number|undefined} $5
 * @property {number|undefined} $6
 * @property {number|undefined} $7
 * @property {number|undefined} $8
 * @property {Component|undefined} $component
 * @property {()=>void|undefined} $connectedCallback
 * @property {()=>void|undefined} $disconnectedCallback
 * @property {(prop:string,indexes:number[])=>void|undefined} $writeCallback
 */

/**
 * @typedef {import("./bindInfo/BindInfo.js").BindInfo} BindInfo
 */

/**
 * @typedef {import("./thread/Thread.js").Thread} Thread
 */

/**
 * @typedef {import("./thread/UpdateSlot.js").UpdateSlot} UpdateSlot
 */

/**
 * @typedef {import("./thread/ViewModelUpdator.js").ProcessData} ProcessData 
 */

/**
 * @typedef {import("./thread/UpdateSlot.js").UpdateSlotStatusCallback} UpdateSlotStatusCallback
 */

/**
 * @typedef {import("./filter/Filter.js").Filter} Filter
 */

/**
 * @typedef {Object} UserComponentModule
 * @property {string|undefined} html
 * @property {typeof ViewModel|undefined} ViewModel
 * @property {HTMLTemplateElement|undefined} template
 * @property {typeof HTMLElement|undefined} extendClass
 * @property {string|undefined} extendTag
 * @property {Object<string,UserComponentModule>} componentModules
 */

/**
 * @typedef {Object} ContextParam
 * @property {PropertyName} propName
 * @property {number[]} indexes
 * @property {number} pos
 */
 
/**
 * @typedef {Object} ContextInfo
 * @property {number[]} indexes
 * @property {ContextParam[]} stack
 */

/**
 * @typedef {(value:any,options:string[])=>any} FilterFunc
 */

/**
 * @typedef {Object} UserFilterData
 * @property {FilterFunc} input
 * @property {FilterFunc} output
 */

/**
 * @typedef {Object} Component
 * @property {ViewModel} viewModel
 * @property {BindInfo[]} binds
 * @property {Thread} thread
 * @property {UpdateSlot} updateSlot
 * @property {Object<string,any>} props
 * @property {Object<string,any>} globals
 * @property {(...args)=>void} initialResolve
 * @property {()=>void} initialReject
 * @property {Promise} initialPromise
 * @property {(...args)=>void} aliveResolve
 * @property {()=>void} aliveReject
 * @property {Promise} alivePromise
 * @property {Component} parentComponent
 * @property {boolean} withShadowRoot
 * @property {ShadowRoot|HTMLElement} viewRootElement
 * @property {()=>void} initialize
 * @property {()=>void} build
 * @property {()=>void} connectedCallback
 * @property {()=>void} disconnectedCallback
 * @property {(setOfViewModelPropertyKeys:Set<String>)=>void} applyToNode
 * @property {{in:Object<string,FilterFunc>,out:Object<string,FilterFunc>}} filters
 * @property {typeof ViewModel} Component.ViewModel
 * @property {HTMLTemplateElement} Component.template
 * @property {typeof HTMLElement} Component.extendClass
 * @property {string} Component.extendTag
 * @property {Object<string,FilterFunc>} Component.inputFilters
 * @property {Object<string,FilterFunc>} Component.outputFilters
 */
