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
/**
 * 
 * @param {any} v 
 * @param {string[]} o 
 * @param {(any,string[])=>any} fn 
 * @returns {any}
 */
const date = (v, o, fn) => {
  return !(v instanceof Date) ? v : fn(v, o);
}

export class outputFilters {
  static styleDisplay = options => value => value ? (options[0] ?? "") : "none";
  static truthy       = options => value => value ? true : false;
  static falsey       = options => value => !value ? true : false;
  static not          = this.falsey;
  static eq           = options => value => value == options[0]; // equality
  static ne           = options => value => value != options[0]; // inequality
  static lt           = options => value => Number(value) < Number(options[0]); // less than
  static le           = options => value => Number(value) <= Number(options[0]); // less than or equal
  static gt           = options => value => Number(value) > Number(options[0]); // greater than
  static ge           = options => value => Number(value) >= Number(options[0]); // greater than or equal
  static oi           = options => value => Number(options[0]) < Number(value) && Number(value) < Number(options[1]); // open interval
  static ci           = options => value => Number(options[0]) <= Number(value) && Number(value) <= Number(options[1]); // closed interval
  static embed        = options => value => (value != null) ? (options[0] ?? "").replaceAll("%s", value) : null;
  static ifText       = options => value => value ? options[0] ?? null : options[1] ?? null;
  static null         = options => value => (value == null) ? true : false;
  static offset       = options => value => Number(value) + Number(options[0]);
  static unit         = options => value => String(value) + String(options[0]);
  static inc          = this.offset;
  static mul          = options => value => Number(value) * Number(options[0]);
  static div          = options => value => Number(value) / Number(options[0]);
  static mod          = options => value => Number(value) % Number(options[0]);
  static object       = options => value => value[options[0]];
  static prefix       = options => value => String(options[0]) + String(value);
  static suffix       = this.unit;
  static date         = options => value => date(value, options, (d, o) => d.toLocaleDateString("sv-SE", o[0] ? o[0] : {}));

  static #str_at      = options => value => str(value, options, (s, o) => s.at(...o));
  static #str_charAt  = options => value => str(value, options, (s, o) => s.charAt(...o));
  static #str_charCodeAt    = options => value => str(value, options, (s, o) => s.charCodeAt(...o));
  static #str_codePointAt   = options => value => str(value, options, (s, o) => s.codePointAt(...o));
  static #str_concat  = options => value => str(value, options, (s, o) => s.concat(...o));
  static #str_endsWith      = options => value => str(value, options, (s, o) => s.endsWith(...o));
  static #str_includes = options => value => str(value, options, (s, o) => s.includes(...o));
  static #str_indexOf  = options => value => str(value, options, (s, o) => s.indexOf(...o));
  static #str_lastIndexOf = options => value => str(value, options, (s, o) => s.lastIndexOf(...o));
  static #str_localeCompare = options => value => str(value, options, (s, o) => s.localeCompare(...o));
  static #str_match         = options => value => str(value, options, (s, o) => s.match(...o));
  static #str_normalize     = options => value => str(value, options, (s, o) => s.normalize(...o));
  static #str_padEnd        = options => value => str(value, options, (s, o) => s.padEnd(...o));
  static #str_padStart      = options => value => str(value, options, (s, o) => s.padStart(...o));
  static #str_repeat        = options => value => str(value, options, (s, o) => s.repeat(...o));
  static #str_replace       = options => value => str(value, options, (s, o) => s.replace(...o));
  static #str_replaceAll    = options => value => str(value, options, (s, o) => s.replaceAll(...o));
  static #str_search        = options => value => str(value, options, (s, o) => s.search(...o));
  static #str_slice   = options => value => str(value, options, (s, o) => s.slice(...o));
  static #str_split         = options => value => str(value, options, (s, o) => s.split(...o));
  static #str_startsWith    = options => value => str(value, options, (s, o) => s.startsWith(...o));
  static #str_substring     = options => value => str(value, options, (s, o) => s.substring(...o));
  static #str_toLocaleLowerCase = options => value => str(value, options, (s, o) => s.toLocaleLowerCase(...o));
  static #str_toLocaleUpperCase = options => value => str(value, options, (s, o) => s.toLocaleUpperCase(...o));
  static #str_toLowerCase   = options => value => str(value, options, (s, o) => s.toLowerCase(...o));
  static #str_toUpperCase   = options => value => str(value, options, (s, o) => s.toUpperCase(...o));
  static #str_trim          = options => value => str(value, options, (s, o) => s.trim(...o));
  static #str_trimEnd       = options => value => str(value, options, (s, o) => s.trimEnd(...o));
  static #str_trimStart     = options => value => str(value, options, (s, o) => s.trimStart(...o));

  static #num_toExponential = options => value => num(value, options, (n, o) => n.toExponential(...o));
  static #num_toFixed       = options => value => num(value, options, (n, o) => n.toFixed(...o));
  static #num_toLocaleString = options => value => num(value, options, (n, o) => n.toLocaleString(...o));
  static #num_toPrecision   = options => value => num(value, options, (n, o) => n.toPrecision(...o));
  
  static #arr_at       = options => value => arr(value, options, (a, o) => a.at(...o));
  static #arr_concat   = options => value => arr(value, options, (a, o) => a.concat(...o));
  static #arr_entries  = options => value => arr(value, options, (a, o) => a.entries(...o));
  static #arr_flat     = options => value => arr(value, options, (a, o) => a.flat(...o));
  static #arr_includes = options => value => arr(value, options, (a, o) => a.includes(...o));
  static #arr_indexOf  = options => value => arr(value, options, (a, o) => a.indexOf(...o));
  static #arr_join     = options => value => arr(value, options, (a, o) => a.join(...o));
  static #arr_keys     = options => value => arr(value, options, (a, o) => a.keys(...o));
  static #arr_lastIndexOf    = options => value => arr(value, options, (a, o) => a.lastIndexOf(...o));
  static #arr_slice    = options => value => arr(value, options, (a, o) => a.slice(...o));
  static #arr_toLocaleString = options => value => arr(value, options, (a, o) => a.toLocaleString(...o));
  static #arr_toReversed     = options => value => arr(value, options, (a, o) => a.toReversed(...o));
  static #arr_toSorted       = options => value => arr(value, options, (a, o) => a.toSorted(...o));
  static #arr_toSpliced      = options => value => arr(value, options, (a, o) => a.toSpliced(...o));
  static #arr_values   = options => value => arr(value, options, (a, o) => a.values(...o));
  static #arr_with     = options => value => arr(value, options, (a, o) => a.with(...o));

  static #date_getDate = options => value => date(value, options, (d, o) => d.getDate(...o));
  static #date_getDay  = options => value => date(value, options, (d, o) => d.getDay(...o));
  static #date_getFullYear      = options => value => date(value, options, (d, o) => d.getFullYear(...o));
  static #date_getHours = options => value => date(value, options, (d, o) => d.getHours(...o));
  static #date_getMilliseconds = options => value => date(value, options, (d, o) => d.getMilliseconds(...o));
  static #date_getMinutes = options => value => date(value, options, (d, o) => d.getMinutes(...o));
  static #date_getMonth = options => value => date(value, options, (d, o) => d.getMonth(...o));
  static #date_getSeconds = options => value => date(value, options, (d, o) => d.getSeconds(...o));
  static #date_getTime = options => value => date(value, options, (d, o) => d.getTime(...o));
  static #date_getTimezoneOffset = options => value => date(value, options, (d, o) => d.getTimezoneOffset(...o));
  static #date_getUTCDate = options => value => date(value, options, (d, o) => d.getUTCDate(...o));
  static #date_getUTCDay = options => value => date(value, options, (d, o) => d.getUTCDay(...o));
  static #date_getUTCFullYear = options => value => date(value, options, (d, o) => d.getUTCFullYear(...o));
  static #date_getUTCHours = options => value => date(value, options, (d, o) => d.getUTCHours(...o));
  static #date_getUTCMilliseconds = options => value => date(value, options, (d, o) => d.getUTCMilliseconds(...o));
  static #date_getUTCMinutes = options => value => date(value, options, (d, o) => d.getUTCMinutes(...o));
  static #date_getUTCMonth = options => value => date(value, options, (d, o) => d.getUTCMonth(...o));
  static #date_getUTCSeconds = options => value => date(value, options, (d, o) => d.getUTCSeconds(...o));
  static #date_toDateString = options => value => date(value, options, (d, o) => d.toDateString(...o));
  static #date_toISOString = options => value => date(value, options, (d, o) => d.toISOString(...o));
  static #date_toJSON = options => value => date(value, options, (d, o) => d.toJSON(...o));
  static #date_toLocaleDateString = options => value => date(value, options, (d, o) => d.toLocaleDateString(...o));
  static #date_toLocaleString = options => value => date(value, options, (d, o) => d.toLocaleString(...o));
  static #date_toLocaleTimeString = options => value => date(value, options, (d, o) => d.toLocaleTimeString(...o));
  static #date_toTimeString = options => value => date(value, options, (d, o) => d.toTimeString(...o));
  static #date_toUTCString = options => value => date(value, options, (d, o) => d.toUTCString(...o));

  static get at() {
    return options => value => (Array.isArray(value) ? this.#arr_at : this.#str_at)(options)(value);
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
    return options => value => (Array.isArray(value) ? this.#arr_concat : this.#str_concat)(options)(value);
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
    return options => value => (Array.isArray(value) ? this.#arr_includes : this.#str_includes)(options)(value);
  }
  static get indexOf() {
    return options => value => (Array.isArray(value) ? this.#arr_indexOf : this.#str_indexOf)(options)(value);
  }
  static get join() {
    return this.#arr_join;
  }
  static get keys() {
    return this.#arr_keys;
  }
  static get lastIndexOf() {
    return options => value => (Array.isArray(value) ? this.#arr_lastIndexOf : this.#str_lastIndexOf)(options)(value);
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
    return options => value => (Array.isArray(value) ? this.#arr_slice : this.#str_slice)(options)(value);
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
    return options => value => (
      (value instanceof Date) ? this.#date_toLocaleString : 
      Array.isArray(value) ? this.#arr_toLocaleString : 
      this.#num_toLocaleString
    )(options)(value);
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

  static get getDate() {
    return this.#date_getDate;
  }
  static get getDay() {
    return this.#date_getDay;
  }
  static get getFullYear() {
    return this.#date_getFullYear;
  }
  static get getHours() {
    return this.#date_getHours;
  }
  static get getMilliseconds() {
    return this.#date_getMilliseconds;
  }
  static get getMinutes() {
    return this.#date_getMinutes;
  }
  static get getMonth() {
    return this.#date_getMonth;
  }
  static get getSeconds() {
    return this.#date_getSeconds;
  }
  static get getTime() {
    return this.#date_getTime;
  }
  static get getTimezoneOffset() {
    return this.#date_getTimezoneOffset;
  }
  static get getUTCDate() {
    return this.#date_getUTCDate;
  }
  static get getUTCDay() {
    return this.#date_getUTCDay;
  }
  static get getUTCFullYear() {
    return this.#date_getUTCFullYear;
  }
  static get getUTCHours() {
    return this.#date_getUTCHours;
  }
  static get getUTCMilliseconds() {
    return this.#date_getUTCMilliseconds;
  }
  static get getUTCMinutes() {
    return this.#date_getUTCMinutes;
  }
  static get getUTCMonth() {
    return this.#date_getUTCMonth;
  }
  static get getUTCSeconds() {
    return this.#date_getUTCSeconds;
  }
  static get toDateString() {
    return this.#date_toDateString;
  }
  static get toISOString() {
    return this.#date_toISOString;
  }
  static get toJSON() {
    return this.#date_toJSON;
  }
  static get toLocaleDateString() {
    return this.#date_toLocaleDateString;
  }
  static get toLocaleTimeString() {
    return this.#date_toLocaleTimeString;
  }
  static get toTimeString() {
    return this.#date_toTimeString;
  }
  static get toUTCString() {
    return this.#date_toUTCString;
  }

}

export class inputFilters {
  static date         = options => value => value === "" ? null : new Date(new Date(value).setHours(0));
  static number       = options => value => value === "" ? null : Number(value);
  static boolean      = options => value => (value === "false" || value === "") ? false : true;
}

export class eventFilters {
  static preventDefault = options => event => {
    event.preventDefault();
    return event;
  }
  static noStopPropagation = options => event => {
    event.noStopPropagation = true;
    return event;
  }
  static pd = this.preventDefault;
  static nsp = this.noStopPropagation;
}