export namespace Functions {

   export interface Generic<A = any, O = void> {
      (...args: Array<A>): O;
   }

   export interface Constructor<T, A = any> {
      new(...args: Array<A>): T;
   }

   export interface Supplier<T = any> {
      supply(): T;
   }

   export interface Converter<I = any, O = any> {
      (item: I): O;
   }

   export interface ToString<T = any> {
      (item: T): string;
   }

   export interface Interceptor<T = any> {
      intercept(ctx: T): any;
   }

   export interface Init {
      init(): void;
   }
}