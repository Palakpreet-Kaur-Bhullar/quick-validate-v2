import test from "node:test";
import assert from "node:assert/strict";
import q from "../src/index.js";

// -------------------- BASIC VALIDATORS --------------------

test("basic validators", () => {
  assert.equal(q.isEmail("hi@example.com"), true);
  assert.equal(q.isEmail("bad"), false);
  assert.equal(q.isEmail(""), false);

  assert.equal(q.isIndianPhone("9876543210"), true);

  assert.equal(q.isIndianPinCode("411001"), true);
  assert.equal(q.isIndianPinCode("12345"), false);

  assert.equal(q.isStrongPassword("GoodPass1!"), true);
  assert.equal(q.isStrongPassword("weak"), false);

  assert.equal(q.isURL("https://example.com"), true);
  assert.equal(q.isURL("not-a-url"), false);

  assert.equal(q.isCreditCard("4111111111111111"), true);
  assert.equal(q.isCreditCard("123"), false);
});

// -------------------- NUMERIC VALIDATORS --------------------

test("numeric validation handles multi-digit values", () => {
  assert.equal(q.isNumeric("1"), true);
  assert.equal(q.isNumeric("123"), true);
  assert.equal(q.isNumeric("411047"), true);
  assert.equal(q.isNumeric(411047), true);

  assert.equal(q.isNumeric("12.5"), true);
  assert.equal(q.isNumeric(12.5), true);

  assert.equal(q.isNumeric("abc"), false);
  assert.equal(q.isNumeric("12abc"), false);
  assert.equal(q.isNumeric(""), false);
});

test("integer validation handles numbers and strings", () => {
  assert.equal(q.isInteger("1"), true);
  assert.equal(q.isInteger("123"), true);
  assert.equal(q.isInteger(123), true);

  assert.equal(q.isInteger("12.5"), false);
  assert.equal(q.isInteger(12.5), false);
  assert.equal(q.isInteger("abc"), false);
});

test("numeric range validation", () => {
  assert.equal(q.isInRange(5, 1, 10), true);
  assert.equal(q.isInRange(1, 1, 10), true);
  assert.equal(q.isInRange(10, 1, 10), true);
  assert.equal(q.isInRange(0, 1, 10), false);
  assert.equal(q.isInRange(11, 1, 10), false);
});

// -------------------- INDIA FORMAT VALIDATORS --------------------

test("India format validators", () => {
  assert.equal(q.isPAN("ABCDE1234F"), true);
  assert.equal(q.isPAN("INVALID"), false);

  assert.equal(q.isGSTIN("27ABCDE1234F1Z5"), true);
  assert.equal(q.isGSTIN("INVALID"), false);

  assert.equal(q.isIFSC("HDFC0001234"), true);
  assert.equal(q.isIFSC("INVALID"), false);

  assert.equal(q.isUPI("person@bank"), true);
  assert.equal(q.isUPI("invalid-upi"), false);

  assert.equal(q.isIndianVehicleNumber("MH12AB1234"), true);
  assert.equal(q.isIndianVehicleNumber("INVALID"), false);

  assert.equal(q.isBankAccount("123456789012"), true);
  assert.equal(q.isBankAccount("123"), false);
});

// -------------------- PHONE VALIDATION --------------------

test("Indian phone validation handles country code formats", () => {
  // Default: 10-digit Indian mobile numbers are accepted
  assert.equal(q.isIndianPhone("9876543210"), true);

  // Explicitly allow numbers without country code
  assert.equal(
    q.isIndianPhone("9876543210", {
      allowWithoutCountryCode: true,
    }),
    true,
  );

  // Explicitly require country code
  assert.equal(
    q.isIndianPhone("9876543210", {
      allowWithoutCountryCode: false,
    }),
    false,
  );

  // +91 country code
  assert.equal(q.isIndianPhone("+919876543210"), true);

  assert.equal(
    q.isIndianPhone("+919876543210", {
      allowWithoutCountryCode: false,
    }),
    true,
  );

  // 0091 country code
  assert.equal(q.isIndianPhone("00919876543210"), true);

  // 91 country code without +
  assert.equal(q.isIndianPhone("919876543210"), true);

  // Invalid Indian mobile number
  assert.equal(q.isIndianPhone("1234567890"), false);
  assert.equal(q.isIndianPhone("987654321"), false);
  assert.equal(q.isIndianPhone("98765432101"), false);
});

// -------------------- DATE VALIDATION --------------------

test("date validation rejects impossible dates", () => {
  assert.equal(q.isDate("2024-01-15"), true);
  assert.equal(q.isDate("2024-02-29"), true);
  assert.equal(q.isDate("2023-02-29"), false);
  assert.equal(q.isDate("2024-02-30"), false);
  assert.equal(q.isDate("2024-13-01"), false);
  assert.equal(q.isDate("not-a-date"), false);
});

test("date-time validation", () => {
  assert.equal(q.isDateTime("2024-01-15T10:30:00"), true);
  assert.equal(q.isDateTime("2024-01-15T10:30:00Z"), true);
  assert.equal(q.isDateTime("2024-01-15T10:30:00+05:30"), true);

  assert.equal(q.isDateTime("invalid"), false);
  assert.equal(q.isDateTime("2024-02-30T10:30:00"), false);
});

// -------------------- OTHER COMMON VALIDATORS --------------------

test("other common validators", () => {
  assert.equal(q.isUsername("john_doe"), true);
  assert.equal(q.isUsername("ab"), false);

  assert.equal(q.isSlug("hello-world"), true);
  assert.equal(q.isSlug("Hello World"), false);

  assert.equal(q.isHexColor("#ffffff"), true);
  assert.equal(q.isHexColor("#12"), false);

  assert.equal(q.isAlphanumeric("abc123"), true);
  assert.equal(q.isAlphanumeric("abc-123"), false);

  assert.equal(q.isJSON('{"name":"John"}'), true);
  assert.equal(q.isJSON("not-json"), false);

  assert.equal(q.isUUID("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(q.isUUID("invalid"), false);
});

// -------------------- SCHEMA VALIDATION --------------------

test("schema reports multiple errors", () => {
  const r = q.validateSchema(
    { name: "A", email: "bad", age: 16 },
    {
      name: ["required", { name: "minLength", value: 2 }],
      email: ["required", "email"],
      age: [{ name: "min", value: 18 }],
    },
  );

  assert.equal(r.valid, false);
  assert.ok(r.errors.name && r.errors.email && r.errors.age);
});

test("schema validation succeeds with valid data", () => {
  const r = q.validateSchema(
    {
      name: "John",
      email: "john@example.com",
      age: 25,
    },
    {
      name: ["required", { name: "minLength", value: 2 }],
      email: ["required", "email"],
      age: [{ name: "min", value: 18 }],
    },
  );

  assert.equal(r.valid, true);
});

// -------------------- SCHEMA SAFETY --------------------

test("validateSchema rejects invalid schema configurations", () => {
  for (const schema of [null, undefined, [], "email", 123]) {
    assert.deepEqual(q.validateSchema({}, schema), {
      valid: false,
      errors: {
        _schema: ["Expected a schema object."],
      },
    });
  }
});

test("validateSchema rejects invalid field configurations", () => {
  for (const config of [null, {}, { messages: {} }]) {
    assert.deepEqual(q.validateSchema({ email: "bad" }, { email: config }), {
      valid: false,
      errors: {
        email: ["Invalid field validation configuration."],
      },
    });
  }
});

test("validateField does not accept inherited schema properties", () => {
  for (const field of ["constructor", "toString", "__proto__"]) {
    assert.deepEqual(q.validateField({}, {}, field), {
      valid: false,
      errors: ["Unknown field."],
    });
  }
});

// -------------------- MALFORMED RULES --------------------

test("malformed rule objects produce clear validation errors", () => {
  assert.deepEqual(q.validate("test", [{}]), {
    valid: false,
    errors: ["Invalid validation rule configuration."],
  });

  assert.deepEqual(q.validate("test", [{ name: "" }]), {
    valid: false,
    errors: ["Invalid validation rule configuration."],
  });

  assert.deepEqual(q.validate("test", [{ value: 5 }]), {
    valid: false,
    errors: ["Invalid validation rule configuration."],
  });
});

test("rules requiring values reject missing configuration", () => {
  assert.deepEqual(q.validate("test", [{ name: "min" }]), {
    valid: false,
    errors: ["Invalid validation rule configuration."],
  });

  assert.deepEqual(q.validate("test", [{ name: "max" }]), {
    valid: false,
    errors: ["Invalid validation rule configuration."],
  });

  assert.deepEqual(q.validate("test", [{ name: "minLength" }]), {
    valid: false,
    errors: ["Invalid validation rule configuration."],
  });

  assert.deepEqual(q.validate("test", [{ name: "maxLength" }]), {
    valid: false,
    errors: ["Invalid validation rule configuration."],
  });
});

// -------------------- CUSTOM MESSAGES --------------------

test("custom message", () => {
  assert.deepEqual(
    q.validate("bad", ["email"], {
      messages: {
        email: "Email incorrect",
      },
    }),
    {
      valid: false,
      errors: ["Email incorrect"],
    },
  );
});

// -------------------- CUSTOM VALIDATORS --------------------

test("custom validator registration and validation", () => {
  q.addValidator("even", (v) => Number(v) % 2 === 0);

  assert.equal(q.validate(4, ["even"]).valid, true);
  assert.equal(q.validate(5, ["even"]).valid, false);

  assert.equal(q.getCustomValidator("even")(4), true);
  assert.equal(q.getCustomValidator("even")(5), false);
});

test("custom validator rejects invalid names", () => {
  const invalidNames = [null, undefined, 123, "", "123abc", "my-validator"];

  for (const name of invalidNames) {
    assert.throws(() => q.addValidator(name, () => true), TypeError);
  }
});

test("custom validator registry does not expose prototype properties", () => {
  const prototypeNames = [
    "toString",
    "constructor",
    "hasOwnProperty",
    "__proto__",
  ];

  for (const name of prototypeNames) {
    assert.equal(q.getCustomValidator(name), undefined);
  }
});

test("custom validator accepts valid names and functions", () => {
  q.addValidator("testCustom", (v) => v === "yes");

  const validator = q.getCustomValidator("testCustom");

  assert.equal(typeof validator, "function");
  assert.equal(validator("yes"), true);
  assert.equal(validator("no"), false);
});

// -------------------- VALIDATION SAFETY --------------------

test("built-in rules take precedence over custom validators", () => {
  q.addValidator("email", () => true);

  assert.equal(q.validate("not-an-email", ["email"]).valid, false);
  assert.equal(q.validate("user@example.com", ["email"]).valid, true);
});

test("custom validator exceptions are handled safely", () => {
  q.addValidator("throws", () => {
    throw new Error("Custom validator error");
  });

  assert.deepEqual(q.validate("test", ["throws"]), {
    valid: false,
    errors: ["throws validation failed."],
  });
});

test("function rule exceptions are handled safely", () => {
  const throwingRule = () => {
    throw new Error("Rule error");
  };

  assert.deepEqual(q.validate("test", [throwingRule]), {
    valid: false,
    errors: ["Value is invalid."],
  });
});

// -------------------- FIELD AND ARRAY VALIDATION --------------------

test("field and array validation", () => {
  const s = {
    email: ["required", "email"],
  };

  assert.equal(q.validateField({ email: "a@b.com" }, s, "email").valid, true);

  assert.equal(
    q.validateArray(["a", "b"], ["required"], {
      minItems: 2,
    }).valid,
    true,
  );

  assert.equal(q.validateArray(["", "b"], ["required"]).valid, false);
});

test("array validation checks item count", () => {
  assert.equal(
    q.validateArray(["a"], ["required"], {
      minItems: 2,
    }).valid,
    false,
  );

  assert.equal(
    q.validateArray(["a", "b", "c"], ["required"], {
      maxItems: 2,
    }).valid,
    false,
  );
});

test("validateArray rejects invalid configuration and sparse arrays", () => {
  assert.equal(q.validateArray(["a"], ["required"], null).valid, false);

  assert.equal(
    q.validateArray(["a"], ["required"], { minItems: -1 }).valid,
    false,
  );

  assert.equal(
    q.validateArray(["a"], ["required"], { minItems: "1" }).valid,
    false,
  );

  assert.equal(
    q.validateArray(["a"], ["required"], { minItems: 1.5 }).valid,
    false,
  );

  assert.equal(
    q.validateArray(["a", "b"], ["required"], {
      minItems: 3,
      maxItems: 1,
    }).valid,
    false,
  );

  assert.equal(q.validateArray(["a"], ["required"], null).valid, false);

  assert.equal(q.validateArray(["a"], ["required"], {}).valid, true);

  const sparse = new Array(2);
  sparse[1] = "valid";

  assert.equal(q.validateArray(sparse, ["required"]).valid, false);
});

test("isArrayOf validates array contents", () => {
  assert.equal(q.isArrayOf([1, 2, 3], q.isInteger), true);
  assert.equal(q.isArrayOf([1, 2, "abc"], q.isInteger), false);
  assert.equal(q.isArrayOf("not-array", q.isInteger), false);
});

// -------------------- NESTED VALIDATION --------------------

test("nested validation", () => {
  const r = q.validateNested(
    {
      profile: {
        email: "bad",
      },
      tags: ["ok", ""],
    },
    {
      profile: {
        type: "object",
        schema: {
          email: ["email"],
        },
      },
      tags: {
        type: "array",
        rules: ["required"],
      },
    },
  );

  assert.equal(r.valid, false);
  assert.ok(r.errors.profile && r.errors.tags);
});

test("validateNested rejects invalid schemas and types", () => {
  assert.equal(q.validateNested({}, null).valid, false);
  assert.equal(q.validateNested({}, []).valid, false);

  assert.equal(
    q.validateNested(
      { value: "test" },
      { value: { type: "unknown", rules: ["required"] } },
    ).valid,
    false,
  );

  assert.equal(
    q.validateNested(
      { items: ["test"] },
      { items: { type: "array", rules: {} } },
    ).valid,
    false,
  );

  assert.equal(
    q.validateNested(
      { address: {} },
      { address: { type: "object", schema: null } },
    ).valid,
    false,
  );
});

test("nested validation succeeds with valid data", () => {
  const r = q.validateNested(
    {
      profile: {
        email: "john@example.com",
      },
      tags: ["javascript", "validation"],
    },
    {
      profile: {
        type: "object",
        schema: {
          email: ["required", "email"],
        },
      },
      tags: {
        type: "array",
        rules: ["required"],
        minItems: 1,
      },
    },
  );

  assert.equal(r.valid, true);
});

// -------------------- OBJECT VALIDATION --------------------

test("object validation", () => {
  const r = q.validateObject(
    {
      name: "John",
      age: 20,
    },
    {
      name: (v) => typeof v === "string" && v.length > 0,
      age: (v) => Number.isInteger(v) && v >= 18,
    },
  );

  assert.equal(r.valid, true);
});

test("object validation handles throwing validators safely", () => {
  const result = q.validateObject(
    { name: "John" },
    {
      name: () => {
        throw new Error("boom");
      },
    },
  );

  assert.equal(result.valid, false);
  assert.ok(result.errors.name);
});

test("object validation detects invalid fields", () => {
  const r = q.validateObject(
    {
      name: "",
      age: 15,
    },
    {
      name: (v) => typeof v === "string" && v.length > 0,
      age: (v) => Number.isInteger(v) && v >= 18,
    },
  );

  assert.equal(r.valid, false);
});

// -------------------- FILE VALIDATION --------------------

test("file validation", () => {
  assert.equal(
    q.isFileValid(
      {
        name: "x.png",
        size: 100,
        type: "image/png",
      },
      {
        maxSize: 200,
        types: ["image/png"],
        extensions: [".png"],
      },
    ),
    true,
  );

  assert.equal(
    q.isFileValid(
      {
        name: "x.exe",
        size: 100,
        type: "application/octet-stream",
      },
      {
        types: ["image/png"],
      },
    ),
    false,
  );
});

// -------------------- PASSWORD CONFIRMATION --------------------

test("password confirmation", () => {
  assert.equal(q.isConfirmPassword("abc", "abc"), true);
  assert.equal(q.isConfirmPassword("abc", "def"), false);
});
