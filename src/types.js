/**
 * @typedef {{html?:string,css?:string,ViewModel:class,template?:HTMLTemplateElement}} UserComponentModule
 * 
 * @typedef {(value:any,options:string[])=>{return:any}} FilterFunc
 * 
 * @typedef {{input:FilterFunc,output:FilterFunc}} UserFilterData
 * 
 * @typedef {Object<string,any>} ViewModel 
 * 
 * @typedef {{
 *   propName:import("../modules/dot-notation/dot-notation.js").PropertyName,
 *   indexes:number[],
 *   pos:number,
 * }} ContextParam
 * 
 * @typedef {{indexes:number[],params:Object<string,ContextParam[]>}} ContextInfo
 */