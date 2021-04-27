/**
 * @author SYESILDAG
 *
 */
import * as React from 'react';
import { GridCellProps } from 'react-virtualized';

import AbstractGridReactNodeProvider, { CellData } from './abstractGridReactNodeProvider';
import AbstractGridScrollSync from './abstractGridScrollSync';


export interface DefaultReactComponentProps<S extends AbstractGridScrollSync = AbstractGridScrollSync,
   T = any,
   E extends CellData<T> = CellData<T>> {
   scrollSync: S;
   gridCellProps: GridCellProps;
   cellData: E;
}

export class DefaultReactComponent<S extends AbstractGridScrollSync = AbstractGridScrollSync,
   T = any,
   E extends CellData<T> = CellData<T>> extends React.Component<DefaultReactComponentProps<S, T, E>> {

   public isMultiSpan() {
      return AbstractGridReactNodeProvider.isMultiSpan(this.props.cellData);
   }

   // noinspection FunctionWithMultipleReturnPointsJS
   public render() {

      let cellData: CellData = this.props.cellData;

      let { scrollSync, gridCellProps } = this.props;
      let { showScrolling } = scrollSync.props;
      let { isScrolling } = gridCellProps;

      let { columnStartIndex, columnStopIndex } = this.props.scrollSync.getViewCoordinates();

      let colspanCellData = cellData?.colspanCellData;
      if (colspanCellData) {
         // noinspection OverlyComplexBooleanExpressionJS
         let newColspan = colspanCellData.colspan - (cellData.columnIndex - colspanCellData.columnIndex);
         // noinspection AssignmentToFunctionParameterJS
         cellData = { ...colspanCellData, colspan: newColspan, columnIndex: cellData.columnIndex };
      }

      // noinspection EqualityComparisonWithCoercionJS
      if (cellData == null) {
         if (showScrolling && isScrolling)
            return "...";
         return <span style={{ backgroundColor: "whitesmoke" }} />;
      }
      else
         // noinspection EqualityComparisonWithCoercionJS
         if (cellData.content == null)
            return null;
         else {
            let edge = cellData.columnIndex == columnStartIndex;
            let nonEdgeColspanCellData = !edge && colspanCellData;
            let multiSpan = AbstractGridReactNodeProvider.isMultiSpan(cellData);
            let width = multiSpan ? (+gridCellProps.style.width * Math.min(columnStopIndex - columnStartIndex + 1, cellData.colspan)) : gridCellProps.style.width;
            let zIndex = multiSpan && !nonEdgeColspanCellData ? 2 : 1;
            let { id, className, sBGColor: backgroundColor } = cellData;
            return (
               <span id={id}
                  className={className}
                  style={{ backgroundColor, zIndex, width }}
                  dangerouslySetInnerHTML={{ __html: nonEdgeColspanCellData ? null : cellData.content }} />
            );
         }
   }
}