# Change Log
All notable changes to this project will be documented in this file.

## 3.1.4 - 3.1.5
- Better null handling

## 3.1.3
- Fix bug from 3.1.2
 
## 3.1.2
- Support touch-enabled errors for nested fields.

## 3.1.1
- Add `canSubmitWithErrors` option

## 3.1.0
- TypeScript 5.0+ support without a deprecation message.

## 3.0.3
- Add `alwaysShowErrors`

## 3.0.2
- Fix typing bug when using with Kea 3.0 non-alpha versions. Thanks @jacobwgillespie

## 3.0.1
- Add values `${form}ManualErrors`, `${form}AllErrors` 
- Add actions `set${from}ManualErrors`
- Add `preSubmit` that can be used to get/set errors. `submit` will only be called if there are no errors in `allError`
- Add `errors` to `submit${form}Failure` 

## 3.0.0 
- Kea 3.0.0 support

## 0.2.0 - 2021-07-15
- Support nested form fields

## 0.1.0 - 2021-07-14
- First version
