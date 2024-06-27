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
 * @property {([string,number[]][])=>void|undefined} $updatedCallback
 */

/**
 * @typedef {Object} ViewModelInfo
 * @property {string[]} removeProps
 * @property {string[]} definedProps
 * @property {string[]} methods
 * @property {string[]} accessorProps
 */

/**
 * @typedef {import("./loopContext/LoopContext.js").LoopContext} LoopContext
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
 * @typedef {Object} FilterInfo
 * @property {string} name
 * @property {string[]} options
 */

/**
 * @typedef {(value:any)=>any} FilterFunc
 */

/**
 * @typedef {(options:string[])=>FilterFunc} FilterFuncWithOption
 */

/**
 * @typedef {(event:Event)=>any} EventFilterFunc
 */

/**
 * @typedef {(options:string[])=>EventFilterFunc} EventFilterFuncWithOption
 */

/**
 * @typedef {Object} ComponentModuleOptions
 * @property {string|undefined} extends
 * for customized built-in element, like extends="button"
 */

/**
 * @typedef {Object} ComponentModuleConfig
 * @property {string|undefined} extends
 * for customized built-in element, like extends="button"
 * @property {boolean|undefined} debug
 * debug mode for the component, default is false
 * @property {boolean|undefined} useShadowRoot
 * attach shadow root to the component, default is false
 * @property {boolean|undefined} useKeyed
 * use keyed, default is true. keyed is used for the component instance.
 * @property {boolean|undefined} useWebComponent
 * use web component, default is true. if false then no custom element.
 * @property {boolean|undefined} useLocalTagName
 * use local tag name, default is true. local custom tag is unique in the document.
 * @property {boolean|undefined} useLocalSelector
 * use local selector, default is true. local selector is unique in the document.
 * @property {boolean|undefined} useOverscrollBehavior
 * use overscroll-behavior, default is true. overscroll-behavior is used for the component instance.
 */

/**
 * @typedef {Object} ComponentModuleFilters
 * @property {Object<string,FilterFuncWithOption>|undefined} input
 * @property {Object<string,FilterFuncWithOption>|undefined} output
 * @property {Object<string,EventFilterFuncWithOption>|undefined} event
 
 */

/**
 * @typedef {Object} ComponentModule
 * @property {string|undefined} html
 * @property {string|undefined} css
 * @property {typeof ViewModel|undefined} ViewModel
 * @property {typeof ViewModel|undefined} State
 * @property {Object<string,ComponentModule>|undefined} componentModules
 * @property {ComponentModuleConfig|undefined} config
 * @property {ComponentModuleOptions|undefined} options
 * @property {ComponentModuleFilters|undefined} filters
 * @property {ComponentModuleConfig|undefined} moduleConfig
 */

/**
 * @typedef {Object} Promises
 * @property {Promise} promise
 * @property {(...args)=>void} resolve
 * @property {()=>void} reject
 */

/**
 * @typedef {Object} ComponentBase
 * @property {ShadowRoot} shadowRoot
 * @property {ViewModel} viewModel
 * @property {ViewModel} baseViewModel
 * @property {ViewModel} writableViewModel
 * @property {ViewModel} readOnlyViewModel
 * @property {BindingManager} rootBinding
 * @property {BindingSummary} bindingSummary
 * @property {Thread} thread
 * @property {UpdateSlot} updateSlot
 * @property {Object<string,any>} props
 * @property {Object<string,any>} globals
 * @property {Promises} initialPromises
 * @property {Promises} alivePromises
 * @property {Component} parentComponent
 * @property {boolean} useShadowRoot
 * @property {boolean} useWebComponent
 * @property {boolean} useLocalTagName
 * @property {boolean} useKeyed
 * @property {boolean} useBufferedBind
 * @property {ShadowRoot|HTMLElement} viewRootElement
 * @property {()=>void} initialize
 * @property {()=>void} build
 * @property {()=>void} connectedCallback
 * @property {()=>void} disconnectedCallback
 * @property {(setOfViewModelPropertyKeys:Set<String>)=>void} updateNode
 * @property {{
 *   in:import("./filter/Manager.js").InputFilterManager,
 *   out:import("./filter/Manager.js").OutputFilterManager,
 *   event:import("./filter/Manager.js").EventFilterManager
 * }} filters
 * @property {ViewModel.constructor} Component.ViewModel
 * @property {HTMLTemplateElement} Component.template
 * @property {HTMLElement.constructor} Component.extendClass
 * @property {string} Component.extends
 * @property {Object<string,FilterFunc>} Component.inputFilters
 * @property {Object<string,FilterFunc>} Component.outputFilters
 * @property {Object<string,EventFilterFunc>} Component.eventFilters
 * @property {string[]} accessibleProperties
 * @property {string[]} allProperties
 * @property {(callback:()=>void)=>Promise<>} writableViewModelCallback
 * @property {import("./updator/updator.js").Updator} updator
 */

/**
 * @typedef {ComponentBase & HTMLElement} Component
 */

/**
 * @typedef {Object} SelectedNode
 * @property {Node} node
 * @property {number[]} routeIndexes
 * @property {string} uuid // template uuid
 * @property {string} key // uuid + routeIndexes.join(","), for identify node
 */
