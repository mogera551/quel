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
 * @typedef {Object} ViewModelInfo
 * @property {string[]} removeProps
 * @property {string[]} definedProps
 * @property {string[]} methods
 * @property {string[]} accessorProps
 */

/**
 * @typedef {import("./binding/Binding.js").Binding} Binding
 */

/**
 * @typedef {import("./binding/Binding.js").BindingManager} BindingManager
 */

/**
 * @typedef {import("./binding/BindingSummary.js").BindingSummary} BindingSummary
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
 * @property {string|undefined} css
 * @property {ViewModel.constructor|undefined} ViewModel
 * @property {HTMLElement.constructor|undefined} extendClass
 * @property {string|undefined} extendTag
 * @property {Object<string,UserComponentModule>} componentModules
 * @property {Object<string,UserComponentModule>} componentModulesForRegist
 * @property {boolean|undefined} useShadowRoot
 * @property {boolean|undefined} usePseudo
 * @property {boolean|undefined} useTagNamesapce
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
 * @typedef {Object} ComponentBase
 * @property {ViewModel} viewModel
 * @property {BindingManager} rootBinding
 * @property {BindingSummary} bindingSummary
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
 * @property {boolean} useShadowRoot
 * @property {boolean} usePseudo
 * @property {boolean} useTagNamespace
 * @property {boolean} useKeyed
 * @property {ShadowRoot|HTMLElement} viewRootElement
 * @property {()=>void} initialize
 * @property {()=>void} build
 * @property {()=>void} connectedCallback
 * @property {()=>void} disconnectedCallback
 * @property {(setOfViewModelPropertyKeys:Set<String>)=>void} updateNode
 * @property {{in:Object<string,FilterFunc>,out:Object<string,FilterFunc>}} filters
 * @property {ViewModel.constructor} Component.ViewModel
 * @property {HTMLTemplateElement} Component.template
 * @property {HTMLElement.constructor} Component.extendClass
 * @property {string} Component.extendTag
 * @property {Object<string,FilterFunc>} Component.inputFilters
 * @property {Object<string,FilterFunc>} Component.outputFilters
 */

/**
 * @typedef {ComponentBase & HTMLElement} Component
 */
