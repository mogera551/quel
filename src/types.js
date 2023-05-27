/**
 * @typedef {import("../modules/dot-notation/dot-notation.js").PropertyName} PropertyName
 * 
 * @typedef {import("../modules/dot-notation/dot-notation.js").PropertyAccess} PropertyAccess 
 * 
 * @typedef {{html?:string,css?:string,ViewModel:class,template?:HTMLTemplateElement,extendClass?:class<HTMLElement>,extendTag?:string}} UserComponentModule
 * 
 * @typedef {(value:any,options:string[])=>{return:any}} FilterFunc
 * 
 * @typedef {{input:FilterFunc,output:FilterFunc}} UserFilterData
 * 
 * @typedef {Object<string,any>} ViewModel 
 * 
 * @typedef {import("./bindInfo/BindInfo.js").BindInfo} BindInfo
 * 
 * @typedef {import("./thread/Thread.js").Thread} Thread
 * 
 * @typedef {import("./thread/UpdateSlot.js").UpdateSlot} UpdateSlot
 * 
 * @typedef {import("./thread/ViewModelUpdator.js").ProcessData} ProcessData 
 * 
 * @typedef {import("./thread/UpdateSlot.js").UpdateSlotStatusCallback} UpdateSlotStatusCallback
 * 
 * 
 * @typedef {import("./filter/Filter.js").Filter} Filter
 * 
 * @typedef {{
 *   propName:PropertyName,
 *   indexes:number[],
 *   pos:number,
 * }} ContextParam
 * 
 * @typedef {{indexes:number[],stack:ContextParam[]}} ContextInfo
 * 
 * @typedef {{
 *   viewModel:ViewModel,
 *   binds:BindInfo[],
 *   thread:Thread,
 *   updateSlot:UpdateSlot,
 *   props:Object<string,any>,
 *   globals:Object<string,any>,
 *   initialResolve:(...args)=>{},
 *   initialReject:()=>{},
 *   initialPromise:Promise,
 *   aliveResolve:(...args)=>{},
 *   aliveReject:()=>{},
 *   alivePromise:Promise,
 *   parentComponent:Component,
 *   withShadowRoot:boolean,
 *   viewRootElement:ShadowRoot|HTMLElement,
 *   initialize:()=>{},
 *   build:()=>{},
 *   connectedCallback:()=>{},
 *   disconnectedCallback:()=>{},
 *   applyToNode:(setOfViewModelPropertyKeys:Set<String>)=>{},
 *   initialize:()=>{},
 *   filters:{
 *     in:Object<string,FilterFunc>,
 *     out:Object<string,FilterFunc>,
 *   },
 *   static ViewModel:class<ViewModel>,
 *   static template:HTMLTemplateElement,
 *   static extendClass:class<HTMLElement>,
 *   static extendTag:string,
 *   static inputFilters:Object<string,FilterFunc>,
 *   static outputFilters:Object<string,FilterFunc>,
 * }} Component
 * 
 */

