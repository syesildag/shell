import { Functions } from './functions';

export namespace Utils {

   export type PropertyNames<T, P> = { [K in keyof T]: T[K] extends P ? K : never }[keyof T];

   export type NonPropertyNames<T, P> = { [K in keyof T]: T[K] extends P ? never : K }[keyof T];

   export type BooleanPropertyNames<T> = PropertyNames<T, Boolean>;

   // noinspection JSUnusedGlobalSymbols
   export type BooleanProperties<T> = Pick<T, BooleanPropertyNames<T>>;

   export type NonBooleanPropertyNames<T> = NonPropertyNames<T, Boolean>;

   // noinspection JSUnusedGlobalSymbols
   export type NonBooleanProperties<T> = Pick<T, NonBooleanPropertyNames<T>>;

   export type FunctionPropertyNames<T> = PropertyNames<T, Function>;

   // noinspection JSUnusedGlobalSymbols
   export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

   export type NonFunctionPropertyNames<T> = NonPropertyNames<T, Function>;

   // noinspection JSUnusedGlobalSymbols
   export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

   export type DebouncedFunction<T = any> = { (...args: Array<T>): any; cancel?(): void };

   export type GroupHash<T> = { [index: string]: T };

   // noinspection JSUnusedLocalSymbols
   export function values<T extends { [index: string]: any[] }>(firstArg: T): Array<Array<any>>;
   // noinspection JSUnusedLocalSymbols
   export function values<T extends { [index: number]: any[] }>(firstArg: T): Array<Array<any>>;
   export function values(obj: any) {
      let values: any[] = [];
      for (let key in obj)
         if (Object.prototype.hasOwnProperty.call(obj, key))
            values.push(obj[key]);
      return values;
   }

   export function NOOP() {
   }

   export function parseURL(url: string) {
      let parser = document.createElement('a'),
         searchObject = [],
         queries, split: any, i;
      // Let the browser do the work
      parser.href = url;
      // Convert query string to object
      queries = parser.search.replace(/^\?/, '').split('&');
      for (i = 0; i < queries.length; i++) {
         split = queries[i].split('=');
         searchObject[split[0]] = split[1];

      }
      return {
         protocol: parser.protocol,
         host: parser.host,
         hostname: parser.hostname,
         port: parser.port,
         pathname: parser.pathname,
         search: parser.search,
         searchObject: searchObject,
         hash: parser.hash
      };
   }

   export interface RGB {
      r: number,
      g: number,
      b: number
   }

   /**
    * Ported from sass implementation in C
    * https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
    */
   export function mixColors(color1: RGB, color2: RGB, amount: number) {
      const weight1 = amount;
      const weight2 = 1 - amount;

      const r = Math.round(weight1 * color1.r + weight2 * color2.r);
      const g = Math.round(weight1 * color1.g + weight2 * color2.g);
      const b = Math.round(weight1 * color1.b + weight2 * color2.b);

      return { r, g, b };
   }

   let size: number;

   export function scrollbarSize(recalc?: boolean) {
      if ((!size && size !== 0) || recalc) {
         if (canUseDOM) {
            const scrollDiv = document.createElement('div');

            scrollDiv.style.position = 'absolute';
            scrollDiv.style.top = '-9999px';
            scrollDiv.style.width = '50px';
            scrollDiv.style.height = '50px';
            scrollDiv.style.overflow = 'scroll';

            document.body.appendChild(scrollDiv);
            size = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv)
         }
      }

      return size
   }

   export const canUseDOM = !!(
      typeof window !== 'undefined' &&
      window.document &&
      window.document.createElement
   );

   // noinspection JSUnusedLocalSymbols
   export function flatten<T, V extends Array<T>, U extends Array<T>>(previousValue: U, currentValue: V, currentIndex: number, array: Array<V>) {
      return [...previousValue, ...currentValue];
   }

   // noinspection JSUnusedLocalSymbols
   export function sum<T extends number>(previousValue: T, currentValue: T, currentIndex?: number, array?: T[]) {
      return previousValue + currentValue;
   }

   export function negateFunction<A = any>(predicate: (this: any, ...args: Array<A>) => boolean) {
      return (...args: Array<A>) => {
         return !predicate.apply(this, args);
      };
   }

   export function identity(value: any) {
      return value;
   }

   /**
    * @param input
    * @returns non space alpha-numeric
    */
   export function trimSpecial(input: string) {
      return input.replace(/[^\w\s]/gi, '');
   }

   export function uuid(): string {
      /*jshint bitwise:false */
      let i: number, random: number;
      let uuid = '';

      // noinspection MagicNumberJS
      for (i = 0; i < 32; i++) {
         // noinspection NonShortCircuitBooleanExpressionJS, MagicNumberJS
         random = Math.random() * 16 | 0;
         // noinspection OverlyComplexBooleanExpressionJS, MagicNumberJS
         if (i === 8 || i === 12 || i === 16 || i === 20) {
            uuid += '-';
         }
         // noinspection MagicNumberJS, NestedConditionalExpressionJS, NonShortCircuitBooleanExpressionJS
         uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
            .toString(16);
      }

      return uuid;
   }

   export function pluralize(count: number, word: string) {
      return count === 1 ? word : word + 's';
   }

   export function capitalize(s: string) {
      return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
   }

   export function store(key: string, data: any): void;
   export function store(key: string): any;
   // noinspection FunctionWithMultipleReturnPointsJS
   export function store(key: string, data?: any): any {
      if (data)
         return localStorage.setItem(key, JSON.stringify(data));

      let store = localStorage.getItem(key);
      return store ? JSON.parse(store) : null;
   }

   // noinspection JSUnusedLocalSymbols
   export function extend<T>(firstArg: T, ...restArgs: Array<T | Partial<T>>): T;
   // noinspection FunctionWithMultipleLoopsJS
   export function extend(...args: Array<any>): any {
      return Object.assign({}, ...args);
   }

   /**
    * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
    * characters such as '012ABC'. The reason why we are not using simply a number counter is that
    * the number string gets longer over time, and it can also overflow, where as the nextId
    * will grow much slower, it is a string, and it will never overflow.
    *
    * @returns {string} an unique alpha-numeric string
    */
   let uid = ['0', '0', '0'];

   // noinspection FunctionWithMultipleReturnPointsJS
   export function nextUid() {
      let index = uid.length,
         digit: number;

      // noinspection IncrementDecrementResultUsedJS
      while (index--) {
         digit = uid[index].charCodeAt(0);
         // noinspection MagicNumberJS
         if (digit == 57 /*'9'*/) {
            uid[index] = 'A';
            return uid.join('');
         }
         // noinspection MagicNumberJS
         if (digit == 90  /*'Z'*/) {
            uid[index] = '0';
         } else {
            uid[index] = String.fromCharCode(digit + 1);
            return uid.join('');
         }
      }
      uid.unshift('0');
      return uid.join('');
   }

   // noinspection RegExpRedundantEscape
   const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;

   export function camelCase(name: string) {
      return name
         .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
         });
   }

   const SNAKE_CASE_REGEXP = /[A-Z]/g;

   export function snake_case(name: string, separator: string) {
      // noinspection AssignmentToFunctionParameterJS
      separator = separator || '_';
      return name.replace(SNAKE_CASE_REGEXP, function (letter, pos) {
         return (pos ? separator : '') + letter.toLowerCase();
      });
   }

   // Returns a function, that, as long as it continues to be invoked, will not
   // be triggered. The function will be called after it stops being called for
   // N milliseconds. If `immediate` is passed, trigger the function on the
   // leading edge, instead of the trailing.
   export function debounce<T = any>(func: (...a: Array<T>) => any, wait?: number, immediate?: boolean): DebouncedFunction<T> {
      let timeout: number;

      let debounced: DebouncedFunction<T> = function (...args: Array<T>) {
         window.clearTimeout(timeout);
         timeout = window.setTimeout(() => {
            timeout = null;
            if (!immediate) func.apply(this, args);
         }, wait);
         if (immediate && !timeout) func.apply(this, args);
      };

      debounced.cancel = function () {
         clearTimeout(timeout);
         timeout = null;
      };

      return debounced;
   }

   // Returns a function that can only be triggered every `delay` milliseconds.
   // In other words, the function will not be called unless it has been more
   // than `delay` milliseconds since the last call.
   export function throttle(func: (...a: any[]) => any, delay: number) {
      let recent: number;
      return function throttled(...args: any[]) {
         let context = this;
         let n: number = now();

         if (!recent || recent - n > delay) {
            func.apply(context, args);
            recent = n;
         }
      };
   }

   export const now: () => number = typeof window !== 'undefined' && window && window.performance ? window.performance.now.bind(window.performance) : Date.now;

   // noinspection JSValidateJSDoc
   /**
    * @ngdoc function
    * @name angular.isUndefined
    * @module ng
    * @kind function
    *
    * @description
    * Determines if a reference is undefined.
    *
    * @param {*} value Reference to check.
    * @returns {boolean} True if `value` is undefined.
    */
   export function isUndefined(value: any): value is undefined {
      return !isDefined(value);
   }

   // noinspection JSValidateJSDoc
   /**
    * @ngdoc function
    * @name angular.isDefined
    * @module ng
    * @kind function
    *
    * @description
    * Determines if a reference is defined.
    *
    * @param {*} value Reference to check.
    * @returns {boolean} True if `value` is defined.
    */
   export function isDefined(value: any): value is any {
      return typeof value !== 'undefined';
   }

   export function isNotNull(value: any): value is any {
      return !isNull(value);
   }

   export function isNull(value: any): value is null {
      return value === null;
   }

   // noinspection JSValidateJSDoc
   /**
    * @ngdoc function
    * @name angular.isObject
    * @module ng
    * @kind function
    *
    * @description
    * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
    * considered to be objects. Note that JavaScript arrays are objects.
    *
    * @param {*} value Reference to check.
    * @returns {boolean} True if `value` is an `Object` but not `null`.
    */
   export function isObject(value: any): value is any {
      // noinspection EqualityComparisonWithCoercionJS
      return value != null && typeof value === 'object';
   }

   // noinspection FunctionWithMultipleReturnPointsJS
   export function getAsString(value: any): string {
      if (!testString(value))
         return '';
      return String(value);
   }

   // noinspection JSValidateJSDoc
   /**
    * @ngdoc function
    * @name angular.isString
    * @module ng
    * @kind function
    *
    * @description
    * Determines if a reference is a `String`.
    *
    * @param {*} value Reference to check.
    * @returns {boolean} True if `value` is a `String`.
    */
   export function isString(value: any): value is string {
      return typeof value === 'string';
   }

   export function testString(value: any): boolean {
      // noinspection EqualityComparisonWithCoercionJS
      return value != null && value !== '';
   }

   // noinspection JSValidateJSDoc
   /**
    * @ngdoc function
    * @name angular.isNumber
    * @module ng
    * @kind function
    *
    * @description
    * Determines if a reference is a `Number`.
    *
    * @param {*} value Reference to check.
    * @returns {boolean} True if `value` is a `Number`.
    */
   export function isNumber(value: any): value is number {
      return typeof value === 'number';
   }

   export function isStringOrNumber(value: any): boolean {
      return isString(value) || isNumber(value);
   }

   // noinspection JSValidateJSDoc
   /**
    * @ngdoc function
    * @name angular.isDate
    * @module ng
    * @kind function
    *
    * @description
    * Determines if a value is a date.
    *
    * @param {*} value Reference to check.
    * @returns {boolean} True if `value` is a `Date`.
    */
   export function isDate(value: any): value is Date {
      return toString.call(value) === '[object Date]';
   }

   // noinspection JSValidateJSDoc
   /**
    * @ngdoc function
    * @name angular.isFunction
    * @module ng
    * @kind function
    *
    * @description
    * Determines if a reference is a `Function`.
    *
    * @param {*} value Reference to check.
    * @returns {boolean} True if `value` is a `Function`.
    */
   export function isFunction(value: any): value is Function {
      return typeof value === 'function';
   }

   /**
    * Determines if a value is a regular expression object.
    *
    * @private
    * @param {*} value Reference to check.
    * @returns {boolean} True if `value` is a `RegExp`.
    */
   export function isRegExp(value: any): value is RegExp {
      return toString.call(value) === '[object RegExp]';
   }

   export function isFile(obj: any): obj is File {
      return toString.call(obj) === '[object File]';
   }

   export function isBlob(obj: any): obj is Blob {
      return toString.call(obj) === '[object Blob]';
   }

   export function isBoolean(value: any): value is boolean {
      return typeof value === 'boolean';
   }

   export function isArray(value: any): value is Array<any> {
      return Array.isArray(value);
   }

   export function isPromiseLike(obj: any): obj is { then(): void } {
      return obj && isDefined(obj) && isFunction(obj.then);
   }

   export function curry(fn: Function): Function {
      // noinspection FunctionWithMultipleReturnPointsJS
      return (...args: Array<any>) => {
         let last = args[args.length - 1];
         if (isFunction(last))
            return fn(...args);

         return (Component: any) => fn(...args, Component);
      };
   }

   export function nullIf<T = any>(arg1: T, arg2: any): T {
      return arg1 === arg2 ? null : arg1;
   }

   // noinspection FunctionWithMultipleReturnPointsJS
   export function coalesce<T = any>(...args: Array<T>): T {

      for (const arg of args)
         if (isNotNull(arg) && isDefined(arg))
            return arg;

      return null;
   }

   // noinspection JSUnusedLocalSymbols
   export function groupBy<T>(list: T[], f1: Functions.ToString<T>): GroupHash<T[]>;
   // noinspection JSUnusedLocalSymbols
   export function groupBy<T>(list: T[], f1: Functions.ToString<T>, f2: Functions.ToString<T>): GroupHash<GroupHash<T[]>>;
   // noinspection JSUnusedLocalSymbols
   export function groupBy<T>(list: T[], f1: Functions.ToString<T>, f2: Functions.ToString<T>, f3: Functions.ToString<T>): GroupHash<GroupHash<GroupHash<T[]>>>;
   // noinspection JSUnusedLocalSymbols
   export function groupBy<T>(list: T[], f1: Functions.ToString<T>, f2: Functions.ToString<T>, f3: Functions.ToString<T>, f4: Functions.ToString<T>): GroupHash<GroupHash<GroupHash<GroupHash<T[]>>>>;
   export function groupBy<T>(list: T[], ...toStringArray: Array<Functions.ToString<T>>): GroupHash<any> {
      let result: GroupHash<any> = {};
      list.forEach(item => {

         let subResult: any = result;
         let idx = 0;

         for (let toString of toStringArray) {
            idx++;
            let key = toString(item);
            let subSubResult = subResult[key];
            if (!subSubResult) {
               subSubResult = idx === toStringArray.length ? [] : {};
               subResult[key] = subSubResult;
            }
            subResult = subSubResult;
         }

         subResult.push(item);
      });
      return result
   }

   export function createChainedFunction(...funcs: Array<Function>): Function {
      // noinspection EqualityComparisonWithCoercionJS, FunctionWithMultipleReturnPointsJS
      return funcs
         .filter(f => f != null)
         .reduce((acc, f) => {
            if (!isFunction(f))
               throw new Error('Invalid Argument Type, must only provide functions, undefined, or null.');

            if (acc === null)
               return f;

            return function chainedFunction(...args: Array<any>) {
               acc.apply(this, args);
               f.apply(this, args);
            };
         }, null);
   }

   export function addClass(element: Element, className: string) {
      element.classList.add(className);
   }

   export function removeClass(element: Element, className: string) {
      element.classList.remove(className);
   }

   export interface FORMAT_TYPE {
      [index: string]: RegExp
   }

   // noinspection JSUnusedGlobalSymbols
   export interface FORMAT extends FORMAT_TYPE {
      'age': RegExp,
      'alpha10': RegExp,
      'alpha12': RegExp,
      'amex': RegExp,
      'amount_pct': RegExp,
      'amount_pct_hyphen': RegExp,
      'aurore': RegExp,
      'avaibility_pct': RegExp,
      'bcmc': RegExp,
      'cb': RegExp,
      'char10': RegExp,
      'char17': RegExp,
      'char2': RegExp,
      'char30': RegExp,
      'char4': RegExp,
      'char5': RegExp,
      'char60': RegExp,
      'char9': RegExp,
      'color_code': RegExp,
      'customer_code': RegExp,
      'email': RegExp,
      'emails': RegExp,
      'float': RegExp,
      'hour': RegExp,
      'int': RegExp,
      'maestro': RegExp,
      'mastercard': RegExp,
      'money': RegExp,
      'money_special': RegExp,
      'money_special_product': RegExp,
      'num2': RegExp,
      'num3': RegExp,
      'num4': RegExp,
      'num_cha_pattern': RegExp,
      'pct': RegExp,
      'pctb': RegExp,
      'positiv_int': RegExp,
      'positiv_int_include_zero': RegExp,
      'product_code': RegExp,
      'quantity': RegExp,
      'smoney': RegExp,
      'squantity': RegExp,
      'squantitydif0': RegExp,
      'stay': RegExp,
      'step': RegExp,
      'text': RegExp,
      'text_point': RegExp,
      'ufloat': RegExp,
      'uint': RegExp,
      'visa': RegExp,
   }

   export const FORMAT_VALUES: FORMAT = {
      'age': /^\d{1,2}\.?\d?$/,
      'alpha10': /^[0-9A-Za-z\/_-]{1,10}$/,
      'alpha12': /^[0-9A-Za-z\/_]{1,12}$/,
      'amex': /^(\d){15}$/,
      'amount_pct': /^%\d{1,2}\.\d{2}|\d{1,2}\.\d{2}%|%100\.00|100\.00%|\d+\.\d{2}$/,
      'amount_pct_hyphen': /^%\d{1,2}\.\d{2}|\d{1,2}\.\d{2}%|%100\.00|100\.00%|\d+\.\d{2}|-$/,
      'aurore': /^(\d){19}$/,
      'avaibility_pct': /^%\d{1,2}\.\d{2}|\d{1,2}\.\d{2}%|%100\.00|100\.00%|\d+$/,
      'bcmc': /^(\d){13,19}$/,
      'cb': /^(\d){16}$/,
      'char10': /^[0-9A-Z_]{1,10}$/,
      'char17': /^[0-9A-Z_]{1,17}$/,
      'char2': /^[0-9A-Z_]{1,2}$/,
      'char30': /^.{0,30}$/,
      'char4': /^[0-9A-Z_]{1,4}$/,
      'char5': /^[0-9A-Z_]{1,5}$/,
      'char60': /^.{0,60}$/,
      'char9': /^[0-9A-Z_]{1,9}$/,
      'color_code': /^[0-9A-F]{6}$/,
      'customer_code': /^[0-9A-Z_\/]{1,9}$/,
      'email': /^[a-zA-Z0-9\-_.]+@[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,5}$/,
      'emails': /^[a-zA-Z0-9\-_.]+@[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,5}(;[a-zA-Z0-9\-_.]+@[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,5})*$/,
      'float': /^\d*\.?\d*$/,
      'hour': /^[0-2]?[0-9]:[0-5]?[0-9]$/,
      'int': /^\d*$/,
      'maestro': /^(\d){13,19}$/,
      'mastercard': /^(\d){16}$/,
      'money': /^\d+\.\d{2}$/,
      'money_special': /^\d+\.\d{2}|-$/,
      'money_special_product': /^-?\d+\.\d{2}|-$/,
      'num2': /^[0-9]{1,2}$/,
      'num3': /^[0-9]{1,3}$/,
      'num4': /^[0-9]{1,4}$/,
      'num_cha_pattern': /^([1-9A-Z_]|0(?=[0-9A-Z_)]))([0-9A-Z_]{0,9})$/g,
      'pct': /^%\d{1,2}\.\d{2}|\d{1,2}\.\d{2}%|%100\.00|100\.00%$/,
      'pctb': /^\d{1,2}\.\d{2}|\d{1,2}\.\d{2}|100\.00|100\.00$/,
      'positiv_int': /^[1-9]\d*$/,
      'positiv_int_include_zero': /^[0-9]\d*$/,
      'product_code': /^[0-9A-Z_]{1,9}$/,
      'quantity': /^\d{1,3}\.\d{2}$/,
      'smoney': /^-?\d+\.\d{2}$/,
      'squantity': /^-?\d{1,3}\.\d{2}$/,
      'squantitydif0': /^-?[1-9][0-9]{0,5}\.\d{2}$/,
      'stay': /^[1-9]\d{0,2}$/,
      'step': /^-?\d+$/,
      'text': /^\w*$/,
      'text_point': /^[\w.]*$/,
      'ufloat': /^-?\d*\.?\d*$/,
      'uint': /^-?\d*$/,
      'visa': /^(\d){16}$/,
   };

   export type FORMAT_KEY = keyof FORMAT;

   export function addScript(content: string) {
      document.head.insertAdjacentHTML('beforeend', content)
   }

   // noinspection JSUnusedLocalSymbols, FunctionWithMoreThanThreeNegationsJS, FunctionWithMultipleReturnPointsJS
   export function shallowEqual(objA: any, objB: any): boolean {

      if (Object.is(objA, objB))
         return true;

      if (!isObject(objA) || !isObject(objB))
         return false;

      const keysA = Object.keys(objA);

      if (keysA.length !== Object.keys(objB).length)
         return false;

      for (let i = 0; i < keysA.length; i++)
         if (!Object.prototype.hasOwnProperty.call(objB, keysA[i])
            || !Object.is(objA[keysA[i]], objB[keysA[i]]))
            return false;

      return true;
   }

   export interface ArgMemoize<I = any, O = any> {
      (params: I): O;
   }

   export function argMemoize<I = any, O = any>(callback: Functions.Converter<I, O>): ArgMemoize<I, O> {
      let cachedParams: any;
      return params => {
         let result: O;
         if (!shallowEqual(params, cachedParams))
            result = callback(params);
         // noinspection ReuseOfLocalVariableJS
         cachedParams = params;
         return result;
      };
   }

   interface StringCache<O> {
      has(key: string): boolean;

      get(key: string): O | undefined;

      set(key: string, value: O): this;
   }

   interface StringCacheConstructor<O> {
      new(): StringCache<O>;

      readonly prototype: StringCache<O>;
   }

   // noinspection JSUnusedLocalSymbols
   function memoize<A = any, O = any>(
      func: Functions.Generic<A, O>,
      resolver: Functions.Converter<Array<A>, string> = JSON.stringify,
      stringCacheConstructor: StringCacheConstructor<O> = Map
   ) {
      let cache: StringCache<O> = new stringCacheConstructor();
      // noinspection FunctionWithMultipleReturnPointsJS
      return function (...args: Array<A>) {
         let key: string = resolver.call(this, args);

         if (cache.has(key))
            return cache.get(key);

         let result: O = func.apply(this, args);
         cache.set(key, result);
         return result;
      };
   }
}