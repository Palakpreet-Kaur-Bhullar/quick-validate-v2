import test from "node:test";
import assert from "node:assert/strict";
import q from "../src/index.js";

test("basic validators", () => {
  assert.equal(q.isEmail("hi@example.com"), true);
  assert.equal(q.isEmail("bad"), false);
  assert.equal(
    q.isIndianPhone("9876543210", { allowWithoutCountryCode: true }),
    true,
  );
  assert.equal(q.isIndianPinCode("411001"), true);
  assert.equal(q.isStrongPassword("GoodPass1!"), true);
  assert.equal(q.isURL("https://example.com"), true);
  assert.equal(q.isCreditCard("4111111111111111"), true);
});
test("India format validators", () => {
  assert.equal(q.isPAN("ABCDE1234F"), true);
  assert.equal(q.isGSTIN("27ABCDE1234F1Z5"), true);
  assert.equal(q.isIFSC("HDFC0001234"), true);
  assert.equal(q.isUPI("person@bank"), true);
  assert.equal(q.isIndianVehicleNumber("MH12AB1234"), true);
  assert.equal(q.isBankAccount("123456789012"), true);
});
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
test("custom message", () =>
  assert.deepEqual(
    q.validate("bad", ["email"], { messages: { email: "Email incorrect" } }),
    { valid: false, errors: ["Email incorrect"] },
  ));
test("custom validator", () => {
  q.addValidator("even", (v) => Number(v) % 2 === 0);
  assert.equal(q.validate(4, ["even"]).valid, true);
  assert.equal(q.validate(5, ["even"]).valid, false);
});
test("field and array validation", () => {
  const s = { email: ["required", "email"] };
  assert.equal(q.validateField({ email: "a@b.com" }, s, "email").valid, true);
  assert.equal(
    q.validateArray(["a", "b"], ["required"], { minItems: 2 }).valid,
    true,
  );
  assert.equal(q.validateArray(["", "b"], ["required"]).valid, false);
});
test("nested validation", () => {
  const r = q.validateNested(
    { profile: { email: "bad" }, tags: ["ok", ""] },
    {
      profile: { type: "object", schema: { email: ["email"] } },
      tags: { type: "array", rules: ["required"] },
    },
  );
  assert.equal(r.valid, false);
  assert.ok(r.errors.profile && r.errors.tags);
});
test("file and confirmation", () => {
  assert.equal(
    q.isFileValid(
      { name: "x.png", size: 100, type: "image/png" },
      { maxSize: 200, types: ["image/png"], extensions: [".png"] },
    ),
    true,
  );
  assert.equal(
    q.isFileValid(
      { name: "x.exe", size: 100, type: "application/octet-stream" },
      { types: ["image/png"] },
    ),
    false,
  );
  assert.equal(q.isConfirmPassword("abc", "abc"), true);
});
