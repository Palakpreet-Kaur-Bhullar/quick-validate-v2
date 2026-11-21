/** quick-validate v2 — lightweight JavaScript validators. */
const str = (v) => (typeof v === "string" ? v.trim() : "");
const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const custom = {};

export const isPresent = (v) =>
  v !== null &&
  v !== undefined &&
  !(typeof v === "string" && !v.trim()) &&
  !(Array.isArray(v) && !v.length);
export const isEmail = (v) => {
  const s = str(v);
  if (!s || s.length > 254 || /\s/.test(s)) return false;
  const p = s.split("@");
  if (p.length !== 2) return false;
  const [local, domain] = p;
  const labels = domain.split(".");
  return (
    !!local &&
    local.length <= 64 &&
    !local.startsWith(".") &&
    !local.endsWith(".") &&
    !local.includes("..") &&
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) &&
    labels.length >= 2 &&
    labels.every(
      (x) =>
        x.length <= 63 && /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(x),
    ) &&
    /^[A-Za-z]{2,}$/.test(labels.at(-1))
  );
};
export const isIndianPhone = (v, o = {}) => {
  let s = str(v).replace(/[\s().-]/g, "");
  if (!s) return false;
  if (o.allowLandline) {
    const t = s
      .replace(/^\+91/, "")
      .replace(/^0091/, "")
      .replace(/^91(?=\d{10}$)/, "");
    if (/^0?[1-9]\d{2,4}\d{6,8}$/.test(t)) return true;
  }
  if (!o.allowWithoutCountryCode && !/^\+91|^0091|^91/.test(s)) return false;
  return /^[6-9]\d{9}$/.test(s.replace(/^\+91|^0091|^91/, ""));
};
export const isPhone = (v, country) =>
  country?.toUpperCase() === "IN"
    ? isIndianPhone(v, { allowWithoutCountryCode: true })
    : /^\+?[1-9]\d{7,14}$/.test(str(v).replace(/[\s().-]/g, ""));
export const isIndianPinCode = (v) => /^[1-9]\d{5}$/.test(str(v));
export const isPostalCode = (v, c) => {
  const s = str(v),
    k = String(c || "").toUpperCase();
  if (["IN", "INDIA"].includes(k)) return isIndianPinCode(s);
  if (["US", "USA"].includes(k)) return /^\d{5}(-\d{4})?$/.test(s);
  if (["CA", "CANADA"].includes(k))
    return /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i.test(s);
  if (["GB", "UK"].includes(k))
    return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(s);
  return /^[A-Z0-9][A-Z0-9 -]{1,10}[A-Z0-9]$/i.test(s);
};
export const isStrongPassword = (v, o = {}) => {
  const s = typeof v === "string" ? v : "";
  return (
    s.length >= (o.minLength ?? 8) &&
    s.length <= (o.maxLength ?? 128) &&
    (o.lowercase === false || /[a-z]/.test(s)) &&
    (o.uppercase === false || /[A-Z]/.test(s)) &&
    (o.number === false || /\d/.test(s)) &&
    (o.symbol === false || /[^A-Za-z0-9\s]/.test(s)) &&
    (o.noSpaces === false || !/\s/.test(s))
  );
};
export const getPasswordStrength = (v) => {
  const s = typeof v === "string" ? v : "";
  const checks = {
    length: s.length >= 8,
    lowercase: /[a-z]/.test(s),
    uppercase: /[A-Z]/.test(s),
    number: /\d/.test(s),
    symbol: /[^A-Za-z0-9\s]/.test(s),
    noSpaces: !/\s/.test(s),
  };
  let score = Object.values(checks).filter(Boolean).length;
  if (s.length >= 14) score++;
  if (s.length < 8) score = Math.min(score, 1);
  score = Math.min(4, score);
  return {
    score,
    label: ["very-weak", "weak", "fair", "strong", "very-strong"][score],
    checks,
  };
};
export const isURL = (v, o = {}) => {
  const s = str(v);
  if (!s || /\s/.test(s)) return false;
  try {
    const u = new URL(/^[a-z][a-z\d+.-]*:/i.test(s) ? s : `https://${s}`);
    return (
      ["http:", "https:"].includes(u.protocol) &&
      (!o.requireHttps || u.protocol === "https:") &&
      !!u.hostname &&
      (o.allowLocalhost ||
        !(u.hostname === "localhost" || !u.hostname.includes(".")))
    );
  } catch {
    return false;
  }
};
export const isDomain = (v) => {
  const s = str(v);
  return (
    !!s &&
    s.length <= 253 &&
    !s.includes("/") &&
    !s.includes("://") &&
    isURL(`https://${s}`)
  );
};
export const isUUID = (v) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str(v),
  );
export const isIPv4 = (v) => {
  const p = str(v).split(".");
  return (
    p.length === 4 &&
    p.every(
      (x) =>
        /^\d{1,3}$/.test(x) && +x <= 255 && (x === "0" || !x.startsWith("0")),
    )
  );
};
export const isIPv6 = (v) => {
  const s = str(v);
  if (!s.includes(":") || !/^[\da-f:]+$/i.test(s)) return false;
  try {
    new URL(`http://[${s}]/`);
    return true;
  } catch {
    return false;
  }
};
export const isIP = (v) => isIPv4(v) || isIPv6(v);
export const isCreditCard = (v) => {
  const d = str(v).replace(/[\s-]/g, "");
  if (!/^\d{13,19}$/.test(d)) return false;
  let sum = 0,
    twice = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = +d[i];
    if (twice && (n *= 2) > 9) n -= 9;
    sum += n;
    twice = !twice;
  }
  return sum % 10 === 0;
};
export const isDate = (v) => {
  const s = str(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number),
    dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
};
export const isDateTime = (v) => {
  const s = str(v);
  return !!s && s.includes("T") && !Number.isNaN(new Date(s).getTime());
};
export const isUsername = (v, o = {}) => {
  const s = str(v);
  return (
    s.length >= (o.minLength ?? 3) &&
    s.length <= (o.maxLength ?? 20) &&
    /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/.test(s)
  );
};
export const isSlug = (v) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str(v));
export const isHexColor = (v, alpha = false) =>
  new RegExp(
    `^#(?:[0-9a-f]{3}|[0-9a-f]{6}${alpha ? "|[0-9a-f]{8}" : ""})$`,
    "i",
  ).test(str(v));
export const isAlphanumeric = (v) => /^[A-Za-z0-9]+$/.test(str(v));
export const isNumeric = (v, o = {}) => {
  const s = str(v);
  return (
    !!s &&
    new RegExp(
      `^${o.negative ? "-?" : ""}\\d${o.decimal === false ? "" : "(?:\\.\\d+)?"}$`,
    ).test(s)
  );
};
export const isInteger = (v, o = {}) => {
  const s = str(v);
  if (!/^-?\d+$/.test(s)) return false;
  const n = Number(s);
  return (
    Number.isSafeInteger(n) &&
    (o.min === undefined || n >= o.min) &&
    (o.max === undefined || n <= o.max)
  );
};
export const isJSON = (v) => {
  if (typeof v !== "string") return false;
  try {
    JSON.parse(v);
    return true;
  } catch {
    return false;
  }
};
export const hasMinLength = (v, n) => typeof v === "string" && v.length >= n;
export const hasMaxLength = (v, n) => typeof v === "string" && v.length <= n;
export const isInRange = (v, min, max) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
export const matchesRegex = (v, r) => {
  if (typeof v !== "string" || !(r instanceof RegExp)) return false;
  r.lastIndex = 0;
  return r.test(v);
};
export const isOneOf = (v, values) =>
  Array.isArray(values) && values.includes(v);
export const isPAN = (v) => /^[A-Z]{5}\d{4}[A-Z]$/.test(str(v).toUpperCase());
export const isGSTIN = (v) => {
  const s = str(v).toUpperCase();
  return (
    /^\d{2}[A-Z]{5}\d{4}[A-Z]\dZ[A-Z0-9]$/.test(s) && isPAN(s.slice(2, 12))
  );
};
export const isIFSC = (v) =>
  /^[A-Z]{4}0[A-Z0-9]{6}$/.test(str(v).toUpperCase());
export const isUPI = (v) => /^[\w.-]{2,256}@[A-Za-z]{2,64}$/.test(str(v));
export const isIndianVehicleNumber = (v) =>
  /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/.test(
    str(v).replace(/\s/g, "").toUpperCase(),
  );
export const isBankAccount = (v, o = {}) => {
  const s = str(v).replace(/\s/g, "");
  return (
    /^\d+$/.test(s) &&
    s.length >= (o.minLength ?? 9) &&
    s.length <= (o.maxLength ?? 18)
  );
};
export const isConfirmPassword = (a, b) =>
  typeof a === "string" && typeof b === "string" && a === b;
export const isFileValid = (file, o = {}) =>
  !!file &&
  typeof file === "object" &&
  typeof file.size === "number" &&
  file.size >= 0 &&
  file.size <= (o.maxSize ?? Infinity) &&
  (!o.types?.length || o.types.includes(file.type)) &&
  (!o.extensions?.length ||
    o.extensions.some((x) =>
      String(file.name || "")
        .toLowerCase()
        .endsWith(x.toLowerCase()),
    ));
export const isArrayOf = (v, fn) =>
  Array.isArray(v) && typeof fn === "function" && v.every(fn);
export const addValidator = (name, fn) => {
  if (!/^[A-Za-z][\w]*$/.test(name) || typeof fn !== "function")
    throw new TypeError("Use a valid validator name and function.");
  custom[name] = fn;
};
export const getCustomValidator = (name) => custom[name];

const rules = {
  required: isPresent,
  email: isEmail,
  phone: isPhone,
  indianPhone: (v) => isIndianPhone(v, { allowWithoutCountryCode: true }),
  pinCode: isIndianPinCode,
  postalCode: isPostalCode,
  password: isStrongPassword,
  url: isURL,
  domain: isDomain,
  uuid: isUUID,
  ipv4: isIPv4,
  ipv6: isIPv6,
  ip: isIP,
  creditCard: isCreditCard,
  date: isDate,
  dateTime: isDateTime,
  username: isUsername,
  slug: isSlug,
  hexColor: isHexColor,
  alphanumeric: isAlphanumeric,
  numeric: isNumeric,
  integer: isInteger,
  json: isJSON,
  pan: isPAN,
  gstin: isGSTIN,
  ifsc: isIFSC,
  upi: isUPI,
  vehicleNumber: isIndianVehicleNumber,
  bankAccount: isBankAccount,
};
const messages = {
  required: "This field is required.",
  email: "Please enter a valid email address.",
  phone: "Please enter a valid phone number.",
  indianPhone: "Please enter a valid Indian mobile number.",
  pinCode: "Please enter a valid Indian PIN code.",
  postalCode: "Please enter a valid postal code.",
  password: "Password does not meet the requirements.",
  url: "Please enter a valid URL.",
  domain: "Please enter a valid domain.",
  uuid: "Please enter a valid UUID.",
  ipv4: "Please enter a valid IPv4 address.",
  ipv6: "Please enter a valid IPv6 address.",
  ip: "Please enter a valid IP address.",
  creditCard: "Please enter a valid card number.",
  date: "Enter a valid date (YYYY-MM-DD).",
  dateTime: "Enter a valid date and time.",
  username: "Username format is invalid.",
  slug: "Slug format is invalid.",
  hexColor: "Enter a valid hex colour.",
  alphanumeric: "Only letters and numbers are allowed.",
  numeric: "Enter a valid number.",
  integer: "Enter a whole number.",
  json: "Enter valid JSON.",
  pan: "Enter a valid PAN format.",
  gstin: "Enter a valid GSTIN format.",
  ifsc: "Enter a valid IFSC code.",
  upi: "Enter a valid UPI ID.",
  vehicleNumber: "Enter a valid vehicle registration number.",
  bankAccount: "Enter a valid bank account number.",
};

/** Validate one value. Rules may be strings, arrays, rule objects, or functions. */
export const validate = (value, ruleList, options = {}) => {
  const errors = [];
  const list = Array.isArray(ruleList) ? ruleList : [ruleList];
  for (const rule of list) {
    let name,
      opts = {},
      msg;
    if (typeof rule === "string") name = rule;
    else if (typeof rule === "function") {
      if (!rule(value)) errors.push(options.message || "Value is invalid.");
      continue;
    } else if (plain(rule)) {
      name = rule.name || rule.rule;
      opts = rule;
      msg = rule.message;
    } else continue;
    if (name === "minLength") {
      const n = opts.value ?? opts.min;
      if (!hasMinLength(value, n))
        errors.push(msg || `Must be at least ${n} characters.`);
      continue;
    }
    if (name === "maxLength") {
      const n = opts.value ?? opts.max;
      if (!hasMaxLength(value, n))
        errors.push(msg || `Must be no more than ${n} characters.`);
      continue;
    }
    if (name === "min") {
      const n = opts.value ?? opts.min;
      if (typeof value !== "number" || value < n)
        errors.push(msg || `Must be at least ${n}.`);
      continue;
    }
    if (name === "max") {
      const n = opts.value ?? opts.max;
      if (typeof value !== "number" || value > n)
        errors.push(msg || `Must be no more than ${n}.`);
      continue;
    }
    if (name === "oneOf") {
      const choices = opts.values ?? opts.choices;
      if (!isOneOf(value, choices))
        errors.push(msg || "Value is not an allowed option.");
      continue;
    }
    if (name === "matches") {
      if (!matchesRegex(value, opts.pattern))
        errors.push(msg || "Value format is invalid.");
      continue;
    }
    const fn = rules[name] || custom[name];
    if (!fn) {
      errors.push(`Unknown validation rule: ${name}`);
      continue;
    }
    if (!fn(value, opts))
      errors.push(
        msg ||
          options.messages?.[name] ||
          messages[name] ||
          `${name} validation failed.`,
      );
  }
  return { valid: errors.length === 0, errors };
};

/** Schema: { field: ['required','email'] } or { field: {rules:[...], messages:{...}} } */
export const validateSchema = (data, schema) => {
  const errors = {};
  if (!plain(data))
    return { valid: false, errors: { _form: ["Expected an object."] } };
  for (const [field, config] of Object.entries(schema || {})) {
    const cfg = Array.isArray(config) ? { rules: config } : config || {};
    const result = validate(data[field], cfg.rules || [], {
      messages: cfg.messages,
    });
    if (!result.valid) errors[field] = result.errors;
  }
  return { valid: Object.keys(errors).length === 0, errors };
};
export const validateField = (data, schema, field) => {
  if (!(field in (schema || {})))
    return { valid: false, errors: ["Unknown field."] };
  const cfg = Array.isArray(schema[field])
    ? { rules: schema[field] }
    : schema[field] || {};
  return validate(data?.[field], cfg.rules || [], { messages: cfg.messages });
};
export const validateArray = (value, itemRules, options = {}) => {
  if (!Array.isArray(value))
    return { valid: false, errors: ["Expected an array."] };
  const errors = [];
  if (options.minItems !== undefined && value.length < options.minItems)
    errors.push(`Must contain at least ${options.minItems} items.`);
  if (options.maxItems !== undefined && value.length > options.maxItems)
    errors.push(`Must contain no more than ${options.maxItems} items.`);
  value.forEach((item, index) => {
    const r = validate(item, itemRules);
    if (!r.valid) errors.push({ index, errors: r.errors });
  });
  return { valid: errors.length === 0, errors };
};
export const validateNested = (data, schema) => {
  const errors = {};
  for (const [key, cfg] of Object.entries(schema || {})) {
    const value = data?.[key];
    let r;
    if (cfg?.type === "object") r = validateSchema(value, cfg.schema);
    else if (cfg?.type === "array")
      r = validateArray(value, cfg.rules || [], cfg);
    else r = validate(value, cfg?.rules || cfg || []);
    if (!r.valid) errors[key] = r.errors;
  }
  return { valid: Object.keys(errors).length === 0, errors };
};
export const validateObject = (data, validators) => {
  const errors = {};
  if (!plain(data))
    return { valid: false, errors: { _form: "Expected an object." } };
  for (const [k, fn] of Object.entries(validators || {}))
    if (typeof fn === "function" && !fn(data[k])) errors[k] = `Invalid ${k}.`;
  return { valid: Object.keys(errors).length === 0, errors };
};
export const quickValidate = {
  isPresent,
  isEmail,
  isIndianPhone,
  isPhone,
  isIndianPinCode,
  isPostalCode,
  isStrongPassword,
  getPasswordStrength,
  isURL,
  isDomain,
  isUUID,
  isIPv4,
  isIPv6,
  isIP,
  isCreditCard,
  isDate,
  isDateTime,
  isUsername,
  isSlug,
  isHexColor,
  isAlphanumeric,
  isNumeric,
  isInteger,
  isJSON,
  hasMinLength,
  hasMaxLength,
  isInRange,
  matchesRegex,
  isOneOf,
  isPAN,
  isGSTIN,
  isIFSC,
  isUPI,
  isIndianVehicleNumber,
  isBankAccount,
  isConfirmPassword,
  isFileValid,
  isArrayOf,
  addValidator,
  getCustomValidator,
  validate,
  validateSchema,
  validateField,
  validateArray,
  validateNested,
  validateObject,
};
export default quickValidate;
