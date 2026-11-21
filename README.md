# quick-validate
Lightweight, dependency-free JavaScript validation helpers for common inputs and forms.

## Install
```bash
npm install quick-validate
```
## Quick use
```js
import validate from 'quick-validate';
validate.isEmail('person@example.com');
validate.isPAN('ABCDE1234F');
validate.isIFSC('HDFC0001234');
```

## Validate a value
```js
import { validate } from 'quick-validate';
validate('bad-email', ['required','email']);
// { valid:false, errors:['Please enter a valid email address.'] }
```
Rules may be strings, arrays, rule objects or custom functions. Supported parameter rules include `{name:'minLength',value:3}`, `{name:'maxLength',value:20}`, `{name:'min',value:18}`, `{name:'max',value:100}`, `{name:'oneOf',values:['red','blue']}`, and `{name:'matches',pattern:/.../}`.

## Validate a schema
```js
import { validateSchema } from 'quick-validate';
const schema={name:['required',{name:'minLength',value:2}],email:['required','email'],age:[{name:'min',value:18}]};
const result=validateSchema({name:'A',email:'bad',age:16},schema);
// result.valid; result.errors contains field-specific arrays.
```

Field configs can also be objects: `{rules:['required','email'], messages:{email:'Use a valid address'}}`.

## Custom rules
```js
import {addValidator,validate} from 'quick-validate';
addValidator('even',value=>Number(value)%2===0);
validate(6,['even']);
```

## Other API
`validateField(data,schema,field)`, `validateArray(value,rules,{minItems,maxItems})`, `validateNested(data,schema)`, `validateObject(data,validatorFunctions)`, `isFileValid(file,{maxSize,types,extensions})`.

Validators include presence, email, phone, Indian mobile/PIN, postal codes, password and strength, URL/domain, UUID, IPv4/IPv6, IP, credit card Luhn, date/time, username, slug, hex colour, alphanumeric, numeric/integer, JSON, PAN, GSTIN format, IFSC, UPI, vehicle registration, bank account format and confirm password.

These checks verify formats, not whether a value exists in an official database. File metadata validation is not a substitute for inspecting uploaded file contents on the server. Credit-card checks do not verify payment authorization.

## Test
```bash
npm test
```
