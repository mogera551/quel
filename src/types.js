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
 * @typedef {import("./thread/Thread.js").Thread} Thread
 */

/**
 * @typedef {import("./thread/UpdateSlot.js").UpdateSlot} UpdateSlot
 */

/**
 * @typedef {import("./thread/ViewModelUpdator.js").ProcessData} ProcessData 
 */

/**
 * @typedef {import("./filter/Filter.js").Filter} Filter
 */

/**
 * @typedef {(value:any,options:string[])=>any} FilterFunc
 */

/**
 * @typedef {(event:Event,options:string[])=>any} EventFilterFunc
 */

/**
 * @typedef {Object} ComponentModuleConfig
 * @property {boolean|undefined} useShadowRoot 
 * attach shadow root to the component, default is false
 * @property {boolean|undefined} useWebComponent 
 * use web component, default is true. if false then no custom element.
 * @property {boolean|undefined} useLocalTagName 
 * use local tag name, default is true. local custom tag is unique in the document.
 * @property {boolean|undefined} useKeyed 
 * use keyed, default is true. keyed is used for the component instance.
 * @property {boolean|undefined} useBufferedBind 
 * use buffered bind, default is false. buffered bind is used for popover or dialog.
 */

/**
 * @typedef {Object} ComponentModuleOptions
 * @property {string|undefined} extends
 * for customized built-in element, like extends="button"
 */

/**
 * @typedef {Object} ComponentModuleFilters
 * @property {Object<string,FilterFunc>|undefined} input
 * @property {Object<string,FilterFunc>|undefined} output
 * @property {Object<string,EventFilterFunc>|undefined} event
 
 */

/**
 * @typedef {Object} ComponentModule
 * @property {string|undefined} html
 * @property {string|undefined} css
 * @property {ViewModel.constructor|undefined} ViewModel
 * @property {Object<string,ComponentModule>|undefined} componentModules
 * @property {ComponentModuleConfig|undefined} config
 * @property {ComponentModuleOptions|undefined} options
 * @property {ComponentModuleFilters|undefined} filters
 */

/**
 * @typedef {Object} Promises
 * @property {Promise} promise
 * @property {(...args)=>void} resolve
 * @property {()=>void} reject
 */

/**
 * @typedef {Object} ComponentBase
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
 * @property {{in:Object<string,FilterFunc>,out:Object<string,FilterFunc>,event:Object<string,EventFilterFunc>}} filters
 * @property {ViewModel.constructor} Component.ViewModel
 * @property {HTMLTemplateElement} Component.template
 * @property {HTMLElement.constructor} Component.extendClass
 * @property {string} Component.extends
 * @property {Object<string,FilterFunc>} Component.inputFilters
 * @property {Object<string,FilterFunc>} Component.outputFilters
 * @property {Object<string,EventFilterFunc>} Component.eventFilters
 */

/**
 * @typedef {ComponentBase & HTMLElement} Component
 */
