/**
 * @author Serkan YESILDAG
 */

export interface Tuple<T, F extends AsyncTask<T>> {
   func: F;
   promise: Promise<T>
}

export interface AsyncTask<T = any> {

   context?: any;

   promise(result?: T): Promise<T>;

   fail?(result: any): T | Promise<T>;

   always?(): void;
}

export interface AsyncTaskDone<T> extends AsyncTask<T> {
   done?(result: T): T;
}

export interface AsyncTaskDoneWithStats<T = any> extends AsyncTaskDone<T> {

   begin?: Date;

   submit?: Date;

   start?: Date;

   end?: Date;
}

export interface ExecutorOptions<T> {
   done?(results: Array<T>): void;

   fail?(e: any): void;

   always?(): void;
}

export interface ConcurrentExecutorOptions<T = any> extends ExecutorOptions<T> {
   availableSlots?: number;
}

export class Executor<T, O extends ExecutorOptions<T>, F extends AsyncTask<T>> {

   protected start?: Date;
   protected end?: Date;
   protected options?: O;

   private _isRunning: boolean = false;

   constructor(protected asyncTasks?: Array<F>) {
   }

   public setOptions(options: O) {
      this.options = options;
   }

   // noinspection JSUnusedGlobalSymbols
   public isRunning(): boolean {
      return this._isRunning;
   }

   public submit(...asyncTasks: Array<F>) {
      if (this._isRunning) {
         this.asyncTasks.push(...asyncTasks);
         for (let asyncTask of asyncTasks as AsyncTaskDoneWithStats[])
            asyncTask.submit = new Date();
      } else {
         // noinspection AssignmentToFunctionParameterJS
         this.asyncTasks = asyncTasks;
         // noinspection JSIgnoredPromiseFromCall
         this.run();
      }
   }

   public async run() {
      this._isRunning = true;
      this.start = new Date();
      try {
         let results = await this._run();
         this.options?.done?.call(this, results);
      } catch (e) {
         if (this.options?.fail)
            this.options?.fail(e);
         else
            throw e;
      } finally {
         this.end = new Date();
         this._isRunning = false;
         this.options?.always?.call(this);
      }
   }

   protected async _run(): Promise<Array<T>> {
      throw new Error("must be overridden");
   }
}

// noinspection JSUnusedGlobalSymbols
export class Sequential<T = any> extends Executor<T, ExecutorOptions<T>, AsyncTask<T>> {

   public async _run() {
      let results: Array<T> = [];
      for (let asyncTask of this.asyncTasks) {
         let { context } = asyncTask;
         let result: T = null;
         try {
            result = await asyncTask.promise.call(context, result);
         } catch (e) {
            if (asyncTask.fail)
               result = await asyncTask.fail.call(context, e);
            else
               throw e;
         } finally {
            asyncTask.always?.call(context);
         }
         results.push(result);
      }

      return results;
   }
}

function shouldStop(availableSlots: number, index: number, length: number) {
   return availableSlots <= 0 || index >= length;
}

// noinspection JSUnusedGlobalSymbols
export class Concurrent<T = any> extends Executor<T, ConcurrentExecutorOptions<T>, AsyncTask<T>> {

   public async _run() {
      let index: number = 0,
         availableSlots = this.options?.availableSlots || Number.MAX_VALUE,
         results: Array<T> = [];

      // noinspection FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS
      let trigger = async (): Promise<Array<T>> => {

         if (shouldStop(availableSlots, index, this.asyncTasks.length))
            return results;

         let tasks: Array<Tuple<T, AsyncTask<T>>> = [];

         while (!shouldStop(availableSlots, index, this.asyncTasks.length)) {
            // noinspection IncrementDecrementResultUsedJS
            let asyncTask: AsyncTask<T> = this.asyncTasks[index];
            tasks.push({ func: asyncTask, promise: asyncTask.promise.call(asyncTask.context) });
            --availableSlots;
            index++;
         }

         for (let task of tasks) {
            let result: T;
            try {
               result = await task.promise;
            } catch (e) {
               if (task.func.fail)
                  result = await task.func.fail.call(task.func.context, e);
               else
                  throw e;
            } finally {
               task.func.always?.call(task.func.context);
            }
            results.push(result);
            ++availableSlots;

            this.asyncTasks.shift();
            index--;
         }

         // noinspection JSIgnoredPromiseFromCall
         return trigger();
      };

      return trigger();
   }
}

export class Parallel<T = any> extends Executor<T, ConcurrentExecutorOptions<T>, AsyncTaskDone<T>> {

   public async _run() {

      return new Promise<Array<T>>((resolve, reject) => {

         let index: number = 0,
            availableSlots = this.options?.availableSlots || Number.MAX_VALUE,
            results: Array<T> = [],
            failed = false;

         // noinspection FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS
         let trigger = () => {

            if (failed)
               return;

            if (shouldStop(availableSlots, index, this.asyncTasks.length))
               resolve(results);

            let tasks: Array<Tuple<T, AsyncTaskDoneWithStats<T>>> = [];

            while (!shouldStop(availableSlots, index, this.asyncTasks.length)) {
               // noinspection IncrementDecrementResultUsedJS
               let asyncTask: AsyncTaskDoneWithStats = this.asyncTasks[index];
               asyncTask.begin = this.start;
               asyncTask.start = new Date();
               tasks.push({ func: asyncTask, promise: asyncTask.promise.call(asyncTask.context) });
               --availableSlots;
               index++;
            }

            for (let task of tasks) {
               task.promise.then((value: T) => {
                  task.func.end = new Date();
                  results.push(task.func.done ? task.func.done.call(task.func.context, value) : value);
               },
                  async (error: any) => {
                     try {
                        if (task.func.fail) {
                           results.push(await task.func.fail.call(task.func.context, error));
                        }
                        else {
                           failed = true;
                           reject(error);
                        }
                     }
                     catch (ex) {
                        failed = true;
                        reject(ex);
                     }
                  });

               task.promise.finally(() => {

                  if (!task.func.start || !task.func.end)
                     throw new Error("unprocessed async task");

                  ++availableSlots;
                  task.func.always?.call(task.func.context);

                  // noinspection AssignmentToFunctionParameterJS
                  let asyncTasks = this.asyncTasks.filter(func => func !== task.func);
                  index -= this.asyncTasks.length - asyncTasks.length;
                  // noinspection AssignmentToFunctionParameterJS
                  this.asyncTasks = asyncTasks;

                  trigger();
               });
            }
         };

         trigger();
      });
   }
}