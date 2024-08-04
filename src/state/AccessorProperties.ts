
type PropertyDescriptors = {
  [x: string]: TypedPropertyDescriptor<any>;
} & {
  [x: string]: PropertyDescriptor;
};

function getDescByNames(target:any):PropertyDescriptors {
  const descByNames:PropertyDescriptors = {};
  let object = target;
  while(object !== Object.prototype) {
    const descs = Object.getOwnPropertyDescriptors(object);
    console.log("descs", descs);
    for(const [name, desc] of Object.entries(descs)) {
      if (Reflect.has(descByNames, name)) continue;
      descByNames[name] = desc;
    }
    object = Object.getPrototypeOf(object);
  }
  return descByNames;
}

function _getAccessorProperties(target:any):string[] {
  const descByNames = getDescByNames(target);
  const accessorProperties:string[] = [];
  for(const [name, desc] of Object.entries(descByNames)) {
    if (desc.get || desc.set) accessorProperties.push(name);
  }
  return accessorProperties;
}

type AccessorPropertiesCache = Map<ObjectConstructor,string[]>;

const _cache:AccessorPropertiesCache = new Map();

export function getAccessorProperties(target:any):string[] {
  let retValue:(string[]|undefined) = _cache.get(target.constructor);
  if (typeof retValue === "undefined") {
    retValue = _getAccessorProperties(target);
    if ({}.constructor !== target.constructor) _cache.set(target.constructor, retValue);
  }
  return retValue;
}
