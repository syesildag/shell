/**
 * @author SYESILDAG
 *
 */
import * as React from 'react';
import { GridCellProps } from 'react-virtualized';

import { Functions } from '../../lib/src/utils/functions';
import { PropertyNames } from '../../lib/src/utils/utils';
import { BaseCellData, CellData, Measurer } from './abstractGridReactNodeProvider';
import AbstractGridScrollSync from './abstractGridScrollSync';

import Supplier = Functions.Supplier;
export default abstract class AbstractGridReactNodeRenderer<S extends AbstractGridScrollSync = AbstractGridScrollSync, T = any, E extends CellData<T> = CellData<T>>
   implements Supplier<T> {

   // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
   public constructor(protected scrollSync: S) {
      this.onChangeType = this.onChangeType.bind(this);
      this.onChangeString = this.onChangeString.bind(this);
      this.onChangeBoolean = this.onChangeBoolean.bind(this);
      this.onChangeInt = this.onChangeInt.bind(this);
      this.onChangeFloat = this.onChangeFloat.bind(this);
   }

   // noinspection JSUnusedGlobalSymbols
   public filter(cellData: E): Partial<E> & Required<BaseCellData<T>> | null {
      let requiredBaseCellData: Required<BaseCellData<T>> = { cellType: this.supply() };
      return { ...cellData, ...requiredBaseCellData };
   }

   abstract render(props: GridCellProps, cellData: E, measurer?: Measurer): React.ReactNode;

   abstract supply(): T;

   protected onChangeType<M>(props: GridCellProps, cellData: E, key: PropertyNames<E, M>, convert?: Functions.Converter<any, M>, clearCache?: boolean) {
      return (e: React.FocusEvent<HTMLInputElement>) => {
         let value = convert ? convert(e.target.value) : e.target.value;
         this.scrollSync.updateCellData(props, key, value, clearCache);
      }
   }

   protected onChangeString(props: GridCellProps, cellData: E, key: PropertyNames<E, string>, clearCache?: boolean) {
      return this.onChangeType<string>(props, cellData, key, String, clearCache);
   }

   protected onChangeBoolean(props: GridCellProps, cellData: E, key: PropertyNames<E, Boolean>, clearCache?: boolean) {
      return this.onChangeType<Boolean>(props, cellData, key, Boolean, clearCache);
   }

   protected onChangeInt(props: GridCellProps, cellData: E, key: PropertyNames<E, number>, clearCache?: boolean) {
      return this.onChangeType<number>(props, cellData, key, parseInt, clearCache);
   }

   protected onChangeFloat(props: GridCellProps, cellData: E, key: PropertyNames<E, number>, clearCache?: boolean) {
      return this.onChangeType<number>(props, cellData, key, parseFloat, clearCache);
   }
}