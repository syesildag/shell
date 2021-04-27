/**
 * @author SYESILDAG
 *
 */
import * as React from 'react';
import { GridCellProps } from 'react-virtualized';

import { CellData } from './abstractGridReactNodeProvider';
import AbstractGridReactNodeRenderer from './abstractGridReactNodeRenderer';
import AbstractGridScrollSync from './abstractGridScrollSync';
import { DefaultReactComponent } from './defaultReactComponent';


// noinspection JSUnusedGlobalSymbols
export class DefaultReactNodeRenderer<S extends AbstractGridScrollSync = AbstractGridScrollSync, T = any, E extends CellData<T> = CellData<T>>
   extends AbstractGridReactNodeRenderer<S, T, E> {

   supply(): any {
      return null;
   }

   // noinspection FunctionWithMultipleReturnPointsJS, IfStatementWithTooManyBranchesJS
   render(gridCellProps: GridCellProps, cellData: E) {
      return (
         <DefaultReactComponent
            scrollSync={this.scrollSync}
            gridCellProps={gridCellProps}
            cellData={cellData} />
      );
   }
}