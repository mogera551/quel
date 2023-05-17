/**
 * @typedef {{html?:string,css?:string,ViewModel:class,template?:HTMLTemplateElement}} UserComponentModule
 * 
 * @typedef {(value:any,options:string[])=>{return:any}} FilterFunc
 * 
 * @typedef {{input:FilterFunc,output:FilterFunc}} UserFilterData
 * 
 * @typedef {Object<string,any>} ViewModel 
 * 
 * @typedef {import("../modules/dot-notation/dot-notation.js").PropertyName} PropertyName
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
 *   method:() => {}
 * }} Comp
 */

