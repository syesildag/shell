import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AutoSizer, CellMeasurerCache } from 'react-virtualized';

import AbstractGridScrollSync, { GridReactNodeProvider } from './abstractGridScrollSync';
import PlanningGridReactNodeProvider from './planningGridReactNodeProvider';

// noinspection JSUnusedGlobalSymbols
export default class PlanningGridScrollSync extends AbstractGridScrollSync {

   public static instance: React.RefObject<PlanningGridScrollSync> = React.createRef<PlanningGridScrollSync>();

   // noinspection FunctionWithMoreThanThreeNegationsJS, FunctionTooLongJS,JSUnusedGlobalSymbols
   public static mount(id: string) {

      // noinspection MagicNumberJS
      let firstColumnWidth = 80;
      // noinspection MagicNumberJS
      let firstRowHeight = 40;
      // noinspection FunctionWithMultipleReturnPointsJS
      let cache = new CellMeasurerCache({
         minWidth: firstColumnWidth,
         defaultWidth: firstColumnWidth,
         minHeight: firstRowHeight,
         defaultHeight: firstRowHeight,
         fixedHeight: true,
         keyMapper: (rowIndex: number, columnIndex: number) => {
            if (columnIndex > 0)
               return 'right';
            return rowIndex;
         }
      });

      cache.set(0, 1, firstColumnWidth, firstRowHeight);

      // noinspection MagicNumberJS, FunctionWithMultipleReturnPointsJS
      ReactDOM.render(
         <AutoSizer disableWidth>
            {({ height }) => (
               <PlanningGridScrollSync
                  ref={PlanningGridScrollSync.instance}
                  deferredMeasurementCache={cache}
                  arrowKeyStepper={"edges"}
                  scrollingResetTimeInterval={150}
                  height={height}
                  columnWidth={cache.columnWidth}
                  rowCount={100}
                  columnCount={Math.max(2, 100)} />
            )}
         </AutoSizer>,
         document.getElementById(id));
   }

   protected getGridReactNodeProvider(): GridReactNodeProvider {
      return new PlanningGridReactNodeProvider(this);
   }
}