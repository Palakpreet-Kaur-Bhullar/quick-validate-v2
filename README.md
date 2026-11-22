# quick-validate

Published Package Link: https://www.npmjs.com/package/@palakpreet/quick-validate
Demo of Usage : https://github.com/Palakpreet-Kaur-Bhullar/quick-validate-v2-demo/tree/main
Live Demo URL : https://quick-validate-v2-demo.onrender.com/

**Lightweight, dependency-free JavaScript validation for common inputs and forms.**

`@palakpreet/quick-validate` is a collection of reusable JavaScript validation helpers designed to make validating user input simple, consistent, and easy to integrate into applications.

It provides individual validators, form and schema validation, custom validation rules, and commonly used Indian input format validations — all without external dependencies.

## Features

- Lightweight and dependency-free
- Written entirely in JavaScript
- Common input validators
- Indian-specific validators
- Password validation and strength checking
- Schema-based form validation
- Multiple validation rules per field
- Custom error messages
- Custom validation rules
- Nested object validation
- Array validation
- File metadata validation
- Simple and consistent error reporting

## Installation

```bash
npm install @palakpreet/quick-validate
```

## Quick Start

```js
import quickValidate from "@palakpreet/quick-validate";

console.log(quickValidate.isEmail("person@example.com"));
// true

console.log(quickValidate.isPAN("ABCDE1234F"));
// true

console.log(quickValidate.isIFSC("HDFC0001234"));
// true
```

## Validate Individual Values

Use the built-in validators directly:

```js
import {
  isEmail,
  isIndianPhone,
  isIndianPinCode,
  isStrongPassword,
  isURL,
  isPAN,
  isGSTIN,
  isIFSC,
  isUPI
} from "@palakpreet/quick-validate";

console.log(isEmail("person@example.com"));
// true

console.log(isIndianPhone("9876543210"));
// true

console.log(isIndianPinCode("411001"));
// true

console.log(isStrongPassword("StrongPass@123"));
// true

console.log(isURL("https://example.com"));
// true

console.log(isPAN("ABCDE1234F"));
// true

console.log(isGSTIN("27ABCDE1234F1Z5"));
// true

console.log(isIFSC("HDFC0001234"));
// true

console.log(isUPI("person@upi"));
// true
```

Individual validators return a boolean indicating whether the value passes the validation check.

## Validate a Value Using Rules

The `validate()` function allows you to combine multiple rules for a single value.

```js
import { validate } from "@palakpreet/quick-validate";

const result = validate("bad-email", ["required", "email"]);

console.log(result);
```

Output:

```js
{
  valid: false,
  errors: [
    "Please enter a valid email address."
  ]
}
```

### Available Rules

Rules can be supplied as strings, arrays, rule objects, or custom functions.

```js
const result = validate("hello", [
  "required",
  { name: "minLength", value: 3 }
]);

console.log(result.valid);
// true
```

Supported parameter-based rules include:

| Rule | Description | Example |
|---|---|---|
| `minLength` | Minimum string length | `{ name: "minLength", value: 3 }` |
| `maxLength` | Maximum string length | `{ name: "maxLength", value: 20 }` |
| `min` | Minimum numeric value | `{ name: "min", value: 18 }` |
| `max` | Maximum numeric value | `{ name: "max", value: 100 }` |
| `oneOf` | Value must match one of the allowed values | `{ name: "oneOf", values: ["red", "blue"] }` |
| `matches` | Value must match a regular expression | `{ name: "matches", pattern: /^[A-Z]+$/ }` |

## Validate an Entire Form

`validateSchema()` validates multiple fields together and returns field-specific errors.

```js
import { validateSchema } from "@palakpreet/quick-validate";

const schema = {
  name: ["required", { name: "minLength", value: 2 }],
  email: ["required", "email"],
  age: [{ name: "min", value: 18 }]
};

const data = {
  name: "A",
  email: "bad-email",
  age: 16
};

const result = validateSchema(data, schema);

console.log(result.valid);
// false

console.log(result.errors);
```

Example result:

```js
{
  valid: false,
  errors: {
    name: ["..."],
    email: ["..."],
    age: ["..."]
  }
}
```

Schema validation makes it possible to validate multiple fields and collect their errors in one operation.

## Custom Error Messages

You can provide your own messages for individual validation rules.

```js
const schema = {
  email: {
    rules: ["required", "email"],
    messages: {
      email: "Please enter a valid email address."
    }
  }
};
```

This allows error messages to be customized according to your application's needs.

## Custom Validation Rules

Add your own reusable validation rules using `addValidator()`.

```js
import {
  addValidator,
  validate
} from "@palakpreet/quick-validate";

addValidator("even", value => Number(value) % 2 === 0);

const result = validate(6, ["even"]);

console.log(result.valid);
// true
```

Custom rules can be reused throughout your application.

## Additional Validation Helpers

```js
import {
  validateField,
  validateArray,
  validateNested,
  validateObject,
  isFileValid
} from "@palakpreet/quick-validate";
```

| Function | Description |
|---|---|
| `validateField(data, schema, field)` | Validates a specific field |
| `validateArray(value, rules, options)` | Validates array values and constraints |
| `validateNested(data, schema)` | Validates nested objects |
| `validateObject(data, validatorFunctions)` | Validates an object using custom validator functions |
| `isFileValid(file, options)` | Validates file metadata such as size and type |

## Available Validators

### General Validators

- Presence and required values
- Email addresses
- Phone numbers
- Postal codes
- Passwords and password strength
- URLs and domains
- UUIDs
- IPv4 and IPv6 addresses
- IP addresses
- Credit card numbers using the Luhn algorithm
- Dates and date-time values
- Usernames
- Slugs
- Hexadecimal colours
- Alphanumeric values
- Numeric values and integers
- JSON strings

### Indian-Specific Validators

- Indian mobile numbers
- Indian PIN codes
- PAN
- GSTIN format
- IFSC
- UPI IDs
- Indian vehicle registration numbers
- Bank account format

### Additional Helpers

- Confirm password
- Minimum and maximum length
- Numeric range
- Regular expression matching
- Allowed values
- Array validation
- File metadata validation

## Running Tests

This project uses Node.js's built-in test runner.

Run the test suite using:

```bash
npm test
```

## Requirements

- Node.js 18 or later
- JavaScript
- ES Modules support

## Important Notes

This package validates input formats and rules. It does not verify values against official databases.

- PAN and GSTIN validation checks format, not registration status.
- IFSC validation checks format, not whether a bank branch currently exists.
- Credit card validation checks the Luhn algorithm, not whether a card is active or authorized.
- File validation checks metadata. Uploaded files must still be inspected securely on the server.

## License

MIT License
