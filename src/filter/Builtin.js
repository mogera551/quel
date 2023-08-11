import "../types.js";

const num = (v, o, fn) => {
  if (v == null) return v;
  const n = Number(v);
  return isNaN(n) ? v : fn(n, o);
}

const str = (v, o, fn) => {
  return (v == null) ? v : fn(String(v), o);
}

const arr = (v, o, fn) => {
  return !Array.isArray(v) ? v : fn(v, o);
}

export class outputFilters {
  static styleDisplay = (value, options) => value ? (options[0] ?? "") : "none";
  static truthy       = (value, options) => value ? true : false;
  static falsey       = (value, options) => !value ? true : false;
  static not          = this.falsey;
  static eq           = (value, options) => value == options[0];
  static ne           = (value, options) => value != options[0];
  static lt           = (value, options) => Number(value) < Number(options[0]);
  static le           = (value, options) => Number(value) <= Number(options[0]);
  static gt           = (value, options) => Number(value) > Number(options[0]);
  static ge           = (value, options) => Number(value) >= Number(options[0]);
  static embed        = (value, options) => (value != null) ? decodeURIComponent((options[0] ?? "").replaceAll("%s", value)) : null;
  static ifText       = (value, options) => value ? options[0] ?? null : options[1] ?? null;
  static null         = (value, options) => (value == null) ? true : false;

  static "str.at"      = (value, options) => str(value, options, (s, o) => s.at(...o));
  static "str.charAt"  = (value, options) => str(value, options, (s, o) => s.charAt(...o));
  static "str.charCodeAt"    = (value, options) => str(value, options, (s, o) => s.charCodeAt(...o));
  static "str.codePointAt"   = (value, options) => str(value, options, (s, o) => s.codePointAt(...o));
  static "str.concat"  = (value, options) => str(value, options, (s, o) => s.concat(...o));
  static "str.endsWith"      = (value, options) => str(value, options, (s, o) => s.endsWith(...o));
  static "str.includes" = (value, options) => str(value, options, (s, o) => s.includes(...o));
  static "str.indexOf"  = (value, options) => str(value, options, (s, o) => s.indexOf(...o));
//  static isWellFormed  = (value, options) => str(value, options, (s, o) => s.isWellFormed());
  static "str.lastIndexOf" = (value, options) => str(value, options, (s, o) => s.lastIndexOf(...o));
  static "str.localeCompare" = (value, options) => str(value, options, (s, o) => s.localeCompare(...o));
  static "str.match"         = (value, options) => str(value, options, (s, o) => s.match(...o));
//  static "str.matchAll"      = (value, options) => str(value, options, (s, o) => s.matchAll(...o));
  static "str.normalize"     = (value, options) => str(value, options, (s, o) => s.normalize(...o));
  static "str.padEnd"        = (value, options) => str(value, options, (s, o) => s.padEnd(...o));
  static "str.padStart"      = (value, options) => str(value, options, (s, o) => s.padStart(...o));
  static "str.repeat"        = (value, options) => str(value, options, (s, o) => s.repeat(...o));
  static "str.replace"       = (value, options) => str(value, options, (s, o) => s.replace(...o));
  static "str.replaceAll"    = (value, options) => str(value, options, (s, o) => s.replaceAll(...o));
  static "str.search"        = (value, options) => str(value, options, (s, o) => s.search(...o));
  static "str.slice"   = (value, options) => str(value, options, (s, o) => s.slice(...o));
  static "str.split"         = (value, options) => str(value, options, (s, o) => s.split(...o));
  static "str.startsWith"    = (value, options) => str(value, options, (s, o) => s.startsWith(...o));
  static "str.substring"     = (value, options) => str(value, options, (s, o) => s.substring(...o));
  static "str.toLocaleLowerCase" = (value, options) => str(value, options, (s, o) => s.toLocaleLowerCase(...o));
  static "str.toLocaleUpperCase" = (value, options) => str(value, options, (s, o) => s.toLocaleUpperCase(...o));
  static "str.toLowerCase"   = (value, options) => str(value, options, (s, o) => s.toLowerCase(...o));
  static "str.toUpperCase"   = (value, options) => str(value, options, (s, o) => s.toUpperCase(...o));
  //static "str.toWellFormed"  = (value, options) => str(value, options, (s, o) => s.toWellFormed(...o));
  static "str.trim"          = (value, options) => str(value, options, (s, o) => s.trim(...o));
  static "str.trimEnd"       = (value, options) => str(value, options, (s, o) => s.trimEnd(...o));
  static "str.trimStart"     = (value, options) => str(value, options, (s, o) => s.trimStart(...o));

  static "num.toExponential" = (value, options) => num(value, options, (n, o) => n.toExponential(...o));
  static "num.toFixed"       = (value, options) => num(value, options, (n, o) => n.toFixed(...o));
  static "num.toLocaleString" = (value, options) => num(value, options, (n, o) => n.toLocaleString(...o));
  static "num.toPrecision"   = (value, options) => num(value, options, (n, o) => n.toPrecision(...o));
  
  static "arr.at"       = (value, options) => arr(value, options, (a, o) => a.at(...o));
  static "arr.concat"   = (value, options) => arr(value, options, (a, o) => a.concat(...o));
  static "arr.copyWithin"     = (value, options) => arr(value, options, (a, o) => a.copyWithin(...o));
  static "arr.entries"  = (value, options) => arr(value, options, (a, o) => a.entries(...o));
  static "arr.fill"     = (value, options) => arr(value, options, (a, o) => a.fill(...o));
  static "arr.flat"     = (value, options) => arr(value, options, (a, o) => a.flat(...o));
  static "arr.includes" = (value, options) => arr(value, options, (a, o) => a.includes(...o));
  static "arr.indexOf"  = (value, options) => arr(value, options, (a, o) => a.indexOf(...o));
  static "arr.join"     = (value, options) => arr(value, options, (a, o) => a.join(...o));
  static "arr.keys"     = (value, options) => arr(value, options, (a, o) => a.keys(...o));
  static "arr.lastIndexOf"    = (value, options) => arr(value, options, (a, o) => a.lastIndexOf(...o));
  static "arr.slice"    = (value, options) => arr(value, options, (a, o) => a.slice(...o));
  static "arr.toLocaleString" = (value, options) => arr(value, options, (a, o) => a.toLocaleString(...o));
  static "arr.toReversed"     = (value, options) => arr(value, options, (a, o) => a.toReversed(...o));
  static "arr.toSorted"       = (value, options) => arr(value, options, (a, o) => a.toSorted(...o));
  static "arr.toSpliced"      = (value, options) => arr(value, options, (a, o) => a.toSpliced(...o));
  static "arr.values"   = (value, options) => arr(value, options, (a, o) => a.values(...o));
  static "arr.with"     = (value, options) => arr(value, options, (a, o) => a.with(...o));

  static get at() {
    return (value, options) => (Array.isArray(value) ? this["arr.at"] : this["str.at"])(value, options);
  }
  static get charAt() {
    return this["str.charAt"];
  }
  static get charCodeAt() {
    return this["str.charCodeAt"];
  }
  static get codePointAt() {
    return this["str.codePointAt"];
  }
  static get concat() {
    return (value, options) => (Array.isArray(value) ? this["arr.concat"] : this["str.concat"])(value, options);
  }
  static get copyWithin() {
    return this["arr.copyWithin"];
  }
  static get endsWith() {
    return this["str.endsWith"];
  }
  static get entries() {
    return this["arr.entries"];
  }
  static get fill() {
    return this["arr.fill"];
  }
  static get flat() {
    return this["arr.flat"];
  }
  static get includes() {
    return (value, options) => (Array.isArray(value) ? this["arr.includes"] : this["str.includes"])(value, options);
  }
  static get indexOf() {
    return (value, options) => (Array.isArray(value) ? this["arr.indexOf"] : this["str.indexOf"])(value, options);
  }
  static get join() {
    return this["arr.join"];
  }
  static get keys() {
    return this["arr.keys"];
  }
  static get lastIndexOf() {
    return (value, options) => (Array.isArray(value) ? this["arr.lastIndexOf"] : this["str.lastIndexOf"])(value, options);
  }
  static get localeCompare() {
    return this["str.localeCompare"];
  }
  static get match() {
    return this["str.match"];
  }
  //static get matchAll() {
  //  return this["str.matchAll"];
  //}
  static get normalize() {
    return this["str.normalize"];
  }
  static get padEnd() {
    return this["str.padEnd"];
  }
  static get padStart() {
    return this["str.padStart"];
  }
  static get repeat() {
    return this["str.repeat"];
  }
  static get replace() {
    return this["str.replace"];
  }
  static get replaceAll() {
    return this["str.replaceAll"];
  }
  static get search() {
    return this["str.search"];
  }
  static get slice() {
    return (value, options) => (Array.isArray(value) ? this["arr.slice"] : this["str.slice"])(value, options);
  }
  static get split() {
    return this["str.split"];
  }
  static get startsWith() {
    return this["str.startsWith"];
  }
  static get substring() {
    return this["str.substring"];
  }
  static get toExponential() {
    return this["num.toExponential"];
  }
  static get toFixed() {
    return this["num.toFixed"];
  }
  static get toLocaleString() {
    return (value, options) => (Array.isArray(value) ? this["arr.toLocaleString"] : this["num.toLocaleString"])(value, options);
  }
  static get toLocaleLowerCase() {
    return this["str.toLocaleLowerCase"];
  }
  static get toLocaleUpperCase() {
    return this["str.toLocaleUpperCase"];
  }
  static get toLowerCase() {
    return this["str.toLowerCase"];
  }
  static get toPrecision() {
    return this["num.toPrecision"];
  }
  static get toReversed() {
    return this["arr.toReversed"];
  }
  static get toSorted() {
    return this["arr.toSorted"];
  }
  static get toSpliced() {
    return this["arr.toSpliced"];
  }
  static get toUpperCase() {
    return this["str.toUpperCase"];
  }
  //static get toWellFormed() {
  //  return this["str.toWellFormed"];
  //}
  static get trim() {
    return this["str.trim"];
  }
  static get trimEnd() {
    return this["str.trimEnd"];
  }
  static get trimStart() {
    return this["str.trimStart"];
  }
  static get values() {
    return this["arr.values"];
  }
  static get with() {
    return this["arr.with"];
  }

}

export class inputFilters {
  static number       = (value, options) => value === "" ? null : Number(value);
  static boolean      = (value, options) => value === "" ? null : Boolean(value);
}