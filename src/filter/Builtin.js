export class outputFilters {
  static localeString = (value, options) => (value != null) ? Number(value).toLocaleString() : null;
  static fixed        = (value, options) => (value != null) ? Number(value).toFixed(options[0] ?? 0) : null;
  static styleDisplay = (value, options) => value ? (options[0] ?? "") : "none";
  static truthy       = (value, options) => value ? true : false;
  static falsey       = (value, options) => !value ? true : false;
  static not          = this.falsey;
  static upperCase    = (value, options) => (value != null) ? String(value).toUpperCase() : null;
  static lowerCase    = (value, options) => (value != null) ? String(value).toLowerCase() : null;
  static eq           = (value, options) => value == options[0];
  static ne           = (value, options) => value != options[0];
  static lt           = (value, options) => Number(value) < Number(options[0]);
  static le           = (value, options) => Number(value) <= Number(options[0]);
  static gt           = (value, options) => Number(value) > Number(options[0]);
  static ge           = (value, options) => Number(value) >= Number(options[0]);
  static embed        = (value, options) => (value != null) ? decodeURI((options[0] ?? "").replaceAll("%s", value)) : null;
  static ifText       = (value, options) => value ? options[0] ?? null : options[1] ?? null;
  static null         = (value, options) => (value == null) ? true : false;
}

export class inputFilters {
  static number       = (value, options) => Number(value);
  static boolean      = (value, options) => Boolean(value);
}