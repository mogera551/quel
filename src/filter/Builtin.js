import "../types.js";

/**
 * 
 * @param {any} v 
 * @param {string[]} o 
 * @param {(any,string[])=>any} fn 
 * @returns {any}
 */
const num = (v, o, fn) => {
  if (v == null) return v;
  const n = Number(v);
  return isNaN(n) ? v : fn(n, o);
}

/**
 * 
 * @param {any} v 
 * @param {string[]} o 
 * @param {(any,string[])=>any} fn 
 * @returns {any}
 */
const str = (v, o, fn) => {
  return (v == null) ? v : fn(String(v), o);
}

/**
 * 
 * @param {any} v 
 * @param {string[]} o 
 * @param {(any,string[])=>any} fn 
 * @returns {any}
 */
const arr = (v, o, fn) => {
  return !Array.isArray(v) ? v : fn(v, o);
}

export class outputFilters {
  static styleDisplay = (value, options) => value ? (options[0] ?? "") : "none";
  static truthy       = (value, options) => value ? true : false;
  static falsey       = (value, options) => !value ? true : false;
  static not          = this.falsey;
  static eq           = (value, options) => value == options[0]; // equality
  static ne           = (value, options) => value != options[0]; // inequality
  static lt           = (value, options) => Number(value) < Number(options[0]); // less than
  static le           = (value, options) => Number(value) <= Number(options[0]); // less than or equal
  static gt           = (value, options) => Number(value) > Number(options[0]); // greater than
  static ge           = (value, options) => Number(value) >= Number(options[0]); // greater than or equal
  static oi           = (value, options) => Number(options[0]) < Number(value) && Number(value) < Number(options[1]); // open interval
  static ci           = (value, options) => Number(options[0]) <= Number(value) && Number(value) <= Number(options[1]); // closed interval
  static embed        = (value, options) => (value != null) ? (options[0] ?? "").replaceAll("%s", value) : null;
  static ifText       = (value, options) => value ? options[0] ?? null : options[1] ?? null;
  static null         = (value, options) => (value == null) ? true : false;
  static offset       = (value, options) => Number(value) + Number(options[0]);
  static unit         = (value, options) => String(value) + String(options[0]);
  static inc          = this.offset;
  static mul          = (value, options) => Number(value) * Number(options[0]);
  static div          = (value, options) => Number(value) / Number(options[0]);
  static mod          = (value, options) => Number(value) % Number(options[0]);
  static object       = (value, options) => value[options[0]];
  static prefix       = (value, options) => String(options[0]) + String(value);
  static suffix       = this.unit;

  static #str_at      = (value, options) => str(value, options, (s, o) => s.at(...o));
  static #str_charAt  = (value, options) => str(value, options, (s, o) => s.charAt(...o));
  static #str_charCodeAt    = (value, options) => str(value, options, (s, o) => s.charCodeAt(...o));
  static #str_codePointAt   = (value, options) => str(value, options, (s, o) => s.codePointAt(...o));
  static #str_concat  = (value, options) => str(value, options, (s, o) => s.concat(...o));
  static #str_endsWith      = (value, options) => str(value, options, (s, o) => s.endsWith(...o));
  static #str_includes = (value, options) => str(value, options, (s, o) => s.includes(...o));
  static #str_indexOf  = (value, options) => str(value, options, (s, o) => s.indexOf(...o));
  static #str_lastIndexOf = (value, options) => str(value, options, (s, o) => s.lastIndexOf(...o));
  static #str_localeCompare = (value, options) => str(value, options, (s, o) => s.localeCompare(...o));
  static #str_match         = (value, options) => str(value, options, (s, o) => s.match(...o));
  static #str_normalize     = (value, options) => str(value, options, (s, o) => s.normalize(...o));
  static #str_padEnd        = (value, options) => str(value, options, (s, o) => s.padEnd(...o));
  static #str_padStart      = (value, options) => str(value, options, (s, o) => s.padStart(...o));
  static #str_repeat        = (value, options) => str(value, options, (s, o) => s.repeat(...o));
  static #str_replace       = (value, options) => str(value, options, (s, o) => s.replace(...o));
  static #str_replaceAll    = (value, options) => str(value, options, (s, o) => s.replaceAll(...o));
  static #str_search        = (value, options) => str(value, options, (s, o) => s.search(...o));
  static #str_slice   = (value, options) => str(value, options, (s, o) => s.slice(...o));
  static #str_split         = (value, options) => str(value, options, (s, o) => s.split(...o));
  static #str_startsWith    = (value, options) => str(value, options, (s, o) => s.startsWith(...o));
  static #str_substring     = (value, options) => str(value, options, (s, o) => s.substring(...o));
  static #str_toLocaleLowerCase = (value, options) => str(value, options, (s, o) => s.toLocaleLowerCase(...o));
  static #str_toLocaleUpperCase = (value, options) => str(value, options, (s, o) => s.toLocaleUpperCase(...o));
  static #str_toLowerCase   = (value, options) => str(value, options, (s, o) => s.toLowerCase(...o));
  static #str_toUpperCase   = (value, options) => str(value, options, (s, o) => s.toUpperCase(...o));
  static #str_trim          = (value, options) => str(value, options, (s, o) => s.trim(...o));
  static #str_trimEnd       = (value, options) => str(value, options, (s, o) => s.trimEnd(...o));
  static #str_trimStart     = (value, options) => str(value, options, (s, o) => s.trimStart(...o));

  static #num_toExponential = (value, options) => num(value, options, (n, o) => n.toExponential(...o));
  static #num_toFixed       = (value, options) => num(value, options, (n, o) => n.toFixed(...o));
  static #num_toLocaleString = (value, options) => num(value, options, (n, o) => n.toLocaleString(...o));
  static #num_toPrecision   = (value, options) => num(value, options, (n, o) => n.toPrecision(...o));
  
  static #arr_at       = (value, options) => arr(value, options, (a, o) => a.at(...o));
  static #arr_concat   = (value, options) => arr(value, options, (a, o) => a.concat(...o));
  static #arr_entries  = (value, options) => arr(value, options, (a, o) => a.entries(...o));
  static #arr_flat     = (value, options) => arr(value, options, (a, o) => a.flat(...o));
  static #arr_includes = (value, options) => arr(value, options, (a, o) => a.includes(...o));
  static #arr_indexOf  = (value, options) => arr(value, options, (a, o) => a.indexOf(...o));
  static #arr_join     = (value, options) => arr(value, options, (a, o) => a.join(...o));
  static #arr_keys     = (value, options) => arr(value, options, (a, o) => a.keys(...o));
  static #arr_lastIndexOf    = (value, options) => arr(value, options, (a, o) => a.lastIndexOf(...o));
  static #arr_slice    = (value, options) => arr(value, options, (a, o) => a.slice(...o));
  static #arr_toLocaleString = (value, options) => arr(value, options, (a, o) => a.toLocaleString(...o));
  static #arr_toReversed     = (value, options) => arr(value, options, (a, o) => a.toReversed(...o));
  static #arr_toSorted       = (value, options) => arr(value, options, (a, o) => a.toSorted(...o));
  static #arr_toSpliced      = (value, options) => arr(value, options, (a, o) => a.toSpliced(...o));
  static #arr_values   = (value, options) => arr(value, options, (a, o) => a.values(...o));
  static #arr_with     = (value, options) => arr(value, options, (a, o) => a.with(...o));

  static get at() {
    return (value, options) => (Array.isArray(value) ? this.#arr_at : this.#str_at)(value, options);
  }
  static get charAt() {
    return this.#str_charAt;
  }
  static get charCodeAt() {
    return this.#str_charCodeAt;
  }
  static get codePointAt() {
    return this.#str_codePointAt;
  }
  static get concat() {
    return (value, options) => (Array.isArray(value) ? this.#arr_concat : this.#str_concat)(value, options);
  }
  static get endsWith() {
    return this.#str_endsWith;
  }
  static get entries() {
    return this.#arr_entries;
  }
  static get flat() {
    return this.#arr_flat;
  }
  static get includes() {
    return (value, options) => (Array.isArray(value) ? this.#arr_includes : this.#str_includes)(value, options);
  }
  static get indexOf() {
    return (value, options) => (Array.isArray(value) ? this.#arr_indexOf : this.#str_indexOf)(value, options);
  }
  static get join() {
    return this.#arr_join;
  }
  static get keys() {
    return this.#arr_keys;
  }
  static get lastIndexOf() {
    return (value, options) => (Array.isArray(value) ? this.#arr_lastIndexOf : this.#str_lastIndexOf)(value, options);
  }
  static get localeCompare() {
    return this.#str_localeCompare;
  }
  static get match() {
    return this.#str_match;
  }
  //static get matchAll() {
  //  return this.#str_matchAll;
  //}
  static get normalize() {
    return this.#str_normalize;
  }
  static get padEnd() {
    return this.#str_padEnd;
  }
  static get padStart() {
    return this.#str_padStart;
  }
  static get repeat() {
    return this.#str_repeat;
  }
  static get replace() {
    return this.#str_replace;
  }
  static get replaceAll() {
    return this.#str_replaceAll;
  }
  static get search() {
    return this.#str_search;
  }
  static get slice() {
    return (value, options) => (Array.isArray(value) ? this.#arr_slice : this.#str_slice)(value, options);
  }
  static get split() {
    return this.#str_split;
  }
  static get startsWith() {
    return this.#str_startsWith;
  }
  static get substring() {
    return this.#str_substring;
  }
  static get toExponential() {
    return this.#num_toExponential;
  }
  static get toFixed() {
    return this.#num_toFixed;
  }
  static get toLocaleString() {
    return (value, options) => (Array.isArray(value) ? this.#arr_toLocaleString : this.#num_toLocaleString)(value, options);
  }
  static get toLocaleLowerCase() {
    return this.#str_toLocaleLowerCase;
  }
  static get toLocaleUpperCase() {
    return this.#str_toLocaleUpperCase;
  }
  static get toLowerCase() {
    return this.#str_toLowerCase;
  }
  static get toPrecision() {
    return this.#num_toPrecision;
  }
  static get toReversed() {
    return this.#arr_toReversed;
  }
  static get toSorted() {
    return this.#arr_toSorted;
  }
  static get toSpliced() {
    return this.#arr_toSpliced;
  }
  static get toUpperCase() {
    return this.#str_toUpperCase;
  }
  //static get toWellFormed() {
  //  return this.#str_toWellFormed;
  //}
  static get trim() {
    return this.#str_trim;
  }
  static get trimEnd() {
    return this.#str_trimEnd;
  }
  static get trimStart() {
    return this.#str_trimStart;
  }
  static get values() {
    return this.#arr_values;
  }
  static get with() {
    return this.#arr_with;
  }

}

export class inputFilters {
  static number       = (value, options) => value === "" ? null : Number(value);
  static boolean      = (value, options) => value === "" ? null : Boolean(value);
}

export class eventFilters {
  static preventDefault = (event, options) => {
    event.preventDefault();
    return event;
  }
  static noStopPropagation = (event, options) => {
    event.noStopPropagation = true;
    return event;
  }
  static pd = this.preventDefault;
  static nsp = this.noStopPropagation;
}