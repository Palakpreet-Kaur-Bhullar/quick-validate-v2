/** quick-validate v2 — lightweight JavaScript validators. */

const str = (v) => (typeof v === "string" ? v.trim() : "");

const numericString = (v) =>
  typeof v === "number" && Number.isFinite(v) ? String(v) : str(v);

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const custom = Object.create(null);

/* -------------------------------------------------------------------------- */
/* Basic validation                                                           */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Phone numbers                                                              */
/* -------------------------------------------------------------------------- */

export const isIndianPhone = (v, o = {}) => {
  let s = str(v).replace(/[\s().-]/g, "");

  if (!s) return false;

  const hasCountryCode =
    s.startsWith("+91") ||
    s.startsWith("0091") ||
    (s.length === 12 && s.startsWith("91"));

  if (s.startsWith("+91")) {
    s = s.slice(3);
  } else if (s.startsWith("0091")) {
    s = s.slice(4);
  } else if (s.length === 12 && s.startsWith("91")) {
    s = s.slice(2);
  }

  if (o.allowLandline) {
    if (/^0?[1-9]\d{2,4}\d{6,8}$/.test(s)) return true;
  }

  // Allow 10-digit mobile numbers by default.
  // Set allowWithoutCountryCode: false to require +91 / 0091 / 91.
  if (o.allowWithoutCountryCode === false && !hasCountryCode) {
    return false;
  }

  return /^[6-9]\d{9}$/.test(s);
};

export const isPhone = (v, country) => {
  const countryCode = String(country ?? "").toUpperCase();

  if (countryCode === "IN") {
    return isIndianPhone(v, {
      allowWithoutCountryCode: true,
    });
  }

  const s = str(v).replace(/[\s().-]/g, "");

  return /^\+?[1-9]\d{7,14}$/.test(s);
};

export const isIndianPinCode = (v) => /^[1-9]\d{5}$/.test(str(v));

export const isPostalCode = (v, country) => {
  const s = str(v);
  const c = String(country || "").toUpperCase();

  if (["IN", "INDIA"].includes(c)) {
    return isIndianPinCode(s);
  }

  if (["US", "USA"].includes(c)) {
    return /^\d{5}(-\d{4})?$/.test(s);
  }

  if (["CA", "CANADA"].includes(c)) {
    return /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i.test(s);
  }

  if (["GB", "UK"].includes(c)) {
    return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(s);
  }

  return /^[A-Z0-9][A-Z0-9 -]{1,10}[A-Z0-9]$/i.test(s);
};

/* -------------------------------------------------------------------------- */
/* Password validation                                                        */
/* -------------------------------------------------------------------------- */

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

  if (s.length < 8) {
    score = Math.min(score, 1);
  }

  score = Math.min(4, score);

  return {
    score,
    label: ["very-weak", "weak", "fair", "strong", "very-strong"][score],
    checks,
  };
};

/* -------------------------------------------------------------------------- */
/* URLs and domains                                                           */
/* -------------------------------------------------------------------------- */

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
  const s = str(v).toLowerCase();

  if (
    !s ||
    s.length > 253 ||
    s.includes("/") ||
    s.includes("://") ||
    s.includes("@") ||
    s.includes(":")
  ) {
    return false;
  }

  const labels = s.split(".");

  if (labels.length < 2) return false;

  if (
    !labels.every(
      (label) =>
        label.length >= 1 &&
        label.length <= 63 &&
        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label),
    )
  ) {
    return false;
  }

  return /^[a-z]{2,}$/.test(labels.at(-1));
};

/* -------------------------------------------------------------------------- */
/* UUID and IP addresses                                                      */
/* -------------------------------------------------------------------------- */

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
        /^\d{1,3}$/.test(x) &&
        Number(x) <= 255 &&
        (x === "0" || !x.startsWith("0")),
    )
  );
};

export const isIPv6 = (v) => {
  const s = str(v);

  if (!s.includes(":") || !/^[\da-f:]+$/i.test(s)) {
    return false;
  }

  try {
    new URL(`http://[${s}]/`);
    return true;
  } catch {
    return false;
  }
};

export const isIP = (v) => isIPv4(v) || isIPv6(v);

/* -------------------------------------------------------------------------- */
/* Credit cards                                                               */
/* -------------------------------------------------------------------------- */

export const isCreditCard = (v) => {
  const d = str(v).replace(/[\s-]/g, "");

  if (!/^\d{13,19}$/.test(d)) return false;

  let sum = 0;
  let twice = false;

  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);

    if (twice) {
      n *= 2;

      if (n > 9) n -= 9;
    }

    sum += n;
    twice = !twice;
  }

  return sum % 10 === 0;
};

/* -------------------------------------------------------------------------- */
/* Date validation                                                            */
/* -------------------------------------------------------------------------- */

export const isDate = (v) => {
  const s = str(v);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return false;
  }

  const [year, month, day] = s.split("-").map(Number);

  if (year < 1 || year > 9999) return false;

  const daysInMonth = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
};

export const isDateTime = (v) => {
  const s = str(v);

  const pattern =
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|[+-]\d{2}:\d{2})?$/;

  const match = s.match(pattern);

  if (!match) return false;

  const [, date, hours, minutes, seconds = "0", , timezone] = match;

  if (!isDate(date)) return false;

  if (Number(hours) > 23) return false;
  if (Number(minutes) > 59) return false;
  if (Number(seconds) > 59) return false;

  if (timezone && timezone !== "Z") {
    const [, offsetHours, offsetMinutes] = timezone.match(
      /^[+-](\d{2}):(\d{2})$/,
    );

    if (Number(offsetHours) > 14) return false;
    if (Number(offsetMinutes) > 59) return false;

    if (Number(offsetHours) === 14 && Number(offsetMinutes) !== 0) {
      return false;
    }
  }

  return !Number.isNaN(Date.parse(s));
};

/* -------------------------------------------------------------------------- */
/* Usernames and text formats                                                 */
/* -------------------------------------------------------------------------- */

export const isUsername = (v, o = {}) => {
  const s = str(v);

  return (
    s.length >= (o.minLength ?? 3) &&
    s.length <= (o.maxLength ?? 20) &&
    /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/.test(s)
  );
};

export const isSlug = (v) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str(v));

export const isHexColor = (v, alpha = false) => {
  const pattern = alpha
    ? /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i
    : /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

  return pattern.test(str(v));
};

export const isAlphanumeric = (v) => /^[A-Za-z0-9]+$/.test(str(v));

/* -------------------------------------------------------------------------- */
/* Numeric validation                                                         */
/* -------------------------------------------------------------------------- */

export const isNumeric = (v, o = {}) => {
  const s = numericString(v);

  if (!s) return false;

  const sign = o.negative ? "-?" : "";
  const decimal = o.decimal === false ? "" : "(?:\\.\\d+)?";

  return new RegExp(`^${sign}\\d+${decimal}$`).test(s);
};

export const isInteger = (v, o = {}) => {
  const s = numericString(v);

  if (!s) return false;

  const pattern = o.negative === false ? /^\d+$/ : /^-?\d+$/;

  if (!pattern.test(s)) return false;

  const n = Number(s);

  return (
    Number.isSafeInteger(n) &&
    (o.min === undefined || n >= o.min) &&
    (o.max === undefined || n <= o.max)
  );
};

/* -------------------------------------------------------------------------- */
/* JSON and length validation                                                 */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Range, regex and option validation                                         */
/* -------------------------------------------------------------------------- */

export const isInRange = (v, min, max) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;

export const matchesRegex = (v, r) => {
  if (typeof v !== "string" || !(r instanceof RegExp)) {
    return false;
  }

  r.lastIndex = 0;

  const result = r.test(v);

  r.lastIndex = 0;

  return result;
};

export const isOneOf = (v, values) =>
  Array.isArray(values) && values.includes(v);

/* -------------------------------------------------------------------------- */
/* Indian business identifiers                                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Password confirmation                                                      */
/* -------------------------------------------------------------------------- */

export const isConfirmPassword = (a, b) =>
  typeof a === "string" && typeof b === "string" && a === b;

/* -------------------------------------------------------------------------- */
/* File validation                                                            */
/* -------------------------------------------------------------------------- */

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
        .endsWith(String(x).toLowerCase()),
    ));

/* -------------------------------------------------------------------------- */
/* Array validation                                                           */
/* -------------------------------------------------------------------------- */

export const isArrayOf = (v, fn) =>
  Array.isArray(v) && typeof fn === "function" && v.every(fn);

/* -------------------------------------------------------------------------- */
/* Custom validators                                                          */
/* -------------------------------------------------------------------------- */

export const addValidator = (name, fn) => {
  if (
    typeof name !== "string" ||
    !/^[A-Za-z][\w]*$/.test(name) ||
    typeof fn !== "function"
  ) {
    throw new TypeError("Use a valid validator name and function.");
  }

  custom[name] = fn;
};

export const getCustomValidator = (name) =>
  typeof name === "string" && Object.hasOwn(custom, name)
    ? custom[name]
    : undefined;

/* -------------------------------------------------------------------------- */
/* Built-in validation rules                                                 */
/* -------------------------------------------------------------------------- */

const rules = {
  required: isPresent,
  email: isEmail,
  phone: isPhone,
  indianPhone: (v) =>
    isIndianPhone(v, {
      allowWithoutCountryCode: true,
    }),
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

/* -------------------------------------------------------------------------- */
/* Default error messages                                                     */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Validate one value                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Validate one value.
 *
 * Rules may be:
 * - Strings
 * - Arrays of rules
 * - Rule objects
 * - Custom functions
 */
export const validate = (value, ruleList, options = {}) => {
  const errors = [];

  const list = Array.isArray(ruleList) ? ruleList : [ruleList];

  for (const rule of list) {
    let name;
    let opts = {};
    let msg;

    if (typeof rule === "string") {
      name = rule;
    } else if (typeof rule === "function") {
      try {
        if (!rule(value)) {
          errors.push(options.message || "Value is invalid.");
        }
      } catch {
        errors.push(options.message || "Value is invalid.");
      }

      continue;
    } else if (plain(rule)) {
      name = rule.name || rule.rule;
      opts = rule;
      msg = rule.message;

      if (typeof name !== "string" || !name.trim()) {
        errors.push("Invalid validation rule configuration.");
        continue;
      }

      if (["min", "max", "minLength", "maxLength"].includes(name)) {
        const n = opts.value ?? opts.min ?? opts.max;

        if (
          typeof n !== "number" ||
          !Number.isFinite(n) ||
          (["minLength", "maxLength"].includes(name) &&
            (!Number.isInteger(n) || n < 0))
        ) {
          errors.push("Invalid validation rule configuration.");
          continue;
        }
      }

      if (name === "oneOf") {
        const choices = opts.values ?? opts.choices;

        if (!Array.isArray(choices)) {
          errors.push("Invalid validation rule configuration.");
          continue;
        }
      }

      if (name === "matches" && !(opts.pattern instanceof RegExp)) {
        errors.push("Invalid validation rule configuration.");
        continue;
      }
    } else {
      errors.push("Invalid validation rule configuration.");
      continue;
    }

    if (name === "minLength") {
      const n = opts.value ?? opts.min;

      if (!hasMinLength(value, n)) {
        errors.push(msg || `Must be at least ${n} characters.`);
      }

      continue;
    }

    if (name === "maxLength") {
      const n = opts.value ?? opts.max;

      if (!hasMaxLength(value, n)) {
        errors.push(msg || `Must be no more than ${n} characters.`);
      }

      continue;
    }

    if (name === "min") {
      const n = opts.value ?? opts.min;

      if (typeof value !== "number" || value < n) {
        errors.push(msg || `Must be at least ${n}.`);
      }

      continue;
    }

    if (name === "max") {
      const n = opts.value ?? opts.max;

      if (typeof value !== "number" || value > n) {
        errors.push(msg || `Must be no more than ${n}.`);
      }

      continue;
    }

    if (name === "oneOf") {
      const choices = opts.values ?? opts.choices;

      if (!isOneOf(value, choices)) {
        errors.push(msg || "Value is not an allowed option.");
      }

      continue;
    }

    if (name === "matches") {
      if (!matchesRegex(value, opts.pattern)) {
        errors.push(msg || "Value format is invalid.");
      }

      continue;
    }

    const fn = Object.hasOwn(rules, name)
      ? rules[name]
      : getCustomValidator(name);

    if (typeof fn !== "function") {
      errors.push(`Unknown validation rule: ${name}`);
      continue;
    }

    try {
      if (!fn(value, opts)) {
        errors.push(
          msg ||
            options.messages?.[name] ||
            messages[name] ||
            `${name} validation failed.`,
        );
      }
    } catch {
      errors.push(msg || `${name} validation failed.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Schema validation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Schema format:
 *
 * {
 *   field: ["required", "email"]
 * }
 *
 * Or:
 *
 * {
 *   field: {
 *     rules: ["required", "email"],
 *     messages: {
 *       email: "Custom error message"
 *     }
 *   }
 * }
 */
export const validateSchema = (data, schema) => {
  const errors = {};

  if (!plain(data)) {
    return {
      valid: false,
      errors: {
        _form: ["Expected an object."],
      },
    };
  }

  if (!plain(schema)) {
    return {
      valid: false,
      errors: {
        _schema: ["Expected a schema object."],
      },
    };
  }

  for (const [field, config] of Object.entries(schema)) {
    let cfg;

    if (Array.isArray(config)) {
      cfg = { rules: config };
    } else if (plain(config) && Array.isArray(config.rules)) {
      cfg = config;
    } else {
      errors[field] = ["Invalid field validation configuration."];
      continue;
    }

    const result = validate(data[field], cfg.rules, {
      messages: cfg.messages,
    });

    if (!result.valid) {
      errors[field] = result.errors;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Single-field schema validation                                             */
/* -------------------------------------------------------------------------- */

export const validateField = (data, schema, field) => {
  if (!plain(schema) || !Object.hasOwn(schema, field)) {
    return {
      valid: false,
      errors: ["Unknown field."],
    };
  }

  const config = schema[field];

  let cfg;

  if (Array.isArray(config)) {
    cfg = { rules: config };
  } else if (plain(config) && Array.isArray(config.rules)) {
    cfg = config;
  } else {
    return {
      valid: false,
      errors: ["Invalid field validation configuration."],
    };
  }

  return validate(data?.[field], cfg.rules, {
    messages: cfg.messages,
  });
};

/* -------------------------------------------------------------------------- */
/* Array schema validation                                                    */
/* -------------------------------------------------------------------------- */

export const validateArray = (value, itemRules, options = {}) => {
  if (!Array.isArray(value)) {
    return {
      valid: false,
      errors: ["Expected an array."],
    };
  }

  if (!plain(options)) {
    return {
      valid: false,
      errors: ["Invalid array validation options."],
    };
  }

  const errors = [];

  const validCount = (count) => Number.isInteger(count) && count >= 0;

  if (options.minItems !== undefined && !validCount(options.minItems)) {
    errors.push("Invalid minItems configuration.");
  }

  if (options.maxItems !== undefined && !validCount(options.maxItems)) {
    errors.push("Invalid maxItems configuration.");
  }

  if (
    validCount(options.minItems) &&
    validCount(options.maxItems) &&
    options.minItems > options.maxItems
  ) {
    errors.push("minItems cannot be greater than maxItems.");
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  if (options.minItems !== undefined && value.length < options.minItems) {
    errors.push(`Must contain at least ${options.minItems} items.`);
  }

  if (options.maxItems !== undefined && value.length > options.maxItems) {
    errors.push(`Must contain no more than ${options.maxItems} items.`);
  }

  for (let index = 0; index < value.length; index++) {
    const result = validate(value[index], itemRules);

    if (!result.valid) {
      errors.push({
        index,
        errors: result.errors,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Nested validation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Nested schema example:
 *
 * {
 *   name: ["required"],
 *   address: {
 *     type: "object",
 *     schema: {
 *       city: ["required"]
 *     }
 *   },
 *   emails: {
 *     type: "array",
 *     rules: ["email"],
 *     minItems: 1
 *   }
 * }
 */
export const validateNested = (data, schema) => {
  if (!plain(schema)) {
    return {
      valid: false,
      errors: {
        _schema: ["Expected a schema object."],
      },
    };
  }

  const errors = {};

  for (const [key, cfg] of Object.entries(schema)) {
    const value = data?.[key];

    let result;

    if (plain(cfg) && cfg.type !== undefined) {
      if (cfg.type === "object") {
        result = validateSchema(value, cfg.schema);
      } else if (cfg.type === "array") {
        result = validateArray(value, cfg.rules ?? [], cfg);
      } else {
        errors[key] = ["Invalid validation type."];
        continue;
      }
    } else if (plain(cfg) && Object.hasOwn(cfg, "rules")) {
      if (!Array.isArray(cfg.rules)) {
        errors[key] = ["Invalid field validation configuration."];
        continue;
      }

      result = validate(value, cfg.rules);
    } else {
      result = validate(value, cfg);
    }

    if (!result.valid) {
      errors[key] = result.errors;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Object validation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Validate object fields using validator functions.
 *
 * Example:
 *
 * validateObject(user, {
 *   email: isEmail,
 *   age: (v) => typeof v === "number" && v >= 18
 * })
 */
export const validateObject = (data, validators) => {
  const errors = {};

  if (!plain(data)) {
    return {
      valid: false,
      errors: {
        _form: "Expected an object.",
      },
    };
  }

  for (const [key, fn] of Object.entries(validators || {})) {
    if (typeof fn !== "function") {
      continue;
    }

    try {
      if (!fn(data[key])) {
        errors[key] = `Invalid ${key}.`;
      }
    } catch {
      errors[key] = `Invalid ${key}.`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Main exported object                                                        */
/* -------------------------------------------------------------------------- */

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
