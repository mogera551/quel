/** @typedef {(items:any, index?:number)=>PropertyKey} GroupingCallbacFn */
/** @type {(items:any[],fn:GroupingCallbacFn)=>Map<PropertyKey,any[]>} */
export const mapGroupBy = Map.groupBy;