/**
 * @author SYESILDAG
 *
 */
import classNames from 'classnames';
import * as React from 'react';
import {
   Alignment,
   ArrowKeyStepper,
   AutoSizer,
   Grid,
   GridCellProps,
   GridProps,
   Index,
   ScrollPosition,
   ScrollSync,
   ScrollSyncChildProps,
} from 'react-virtualized';
import { ScrollIndices } from 'react-virtualized/dist/es/ArrowKeyStepper';
import { CellPosition, MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer';
import { RenderedSection, ScrollOffset, ScrollParams, SectionRenderedParams } from 'react-virtualized/dist/es/Grid';

import { isFunction, scrollbarSize } from '../../lib/src/utils/utils';

import CSSProperties = React.CSSProperties;

export type ClassKey =
   'ArrowKeyStepper'
   | 'ScrollSyncContainer'
   | 'HeaderBodyGridContainer'
   | 'GridRow'
   | 'LeftSideGridContainer'
   | 'HeaderGridContainer'
   | 'HeaderGrid'
   | 'GridColumn'
   | 'BodyGridContainer'
   | 'BodyGrid'
   | 'LeftHeaderGridContainer'
   | 'LeftHeaderGrid'
   | 'LeftSideGrid'
   | 'leftHeaderCell'
   | 'headerCell'
   | 'bodyCell'
   | 'leftSideCell'
   | 'selectedRow'
   | 'evenRow'
   | 'oddRow'
   | 'selectedColumn'
   | 'evenColumn'
   | 'oddColumn';

export interface ClassNameParams {
   classes: ClassNameMap<ClassKey>,
   rowIndex: number,
   columnIndex: number,
   handleMouseEnter?: boolean,
   highlightSelectedRow?: boolean,
   highlightSelectedColumn?: boolean,
   selectedRowIndex?: number,
   selectedColumnIndex?: number
}

export type ArrowKeyStepperMode = 'edges' | 'cells';

export type ClassNameMap<ClassKey extends string = string> = Record<ClassKey, string>;

export interface AbstractScrollSyncProps extends Partial<GridProps> {
   showScrolling?: boolean,
   arrowKeyStepper?: ArrowKeyStepperMode,
   classes?: ClassNameMap<ClassKey>;
}

export interface AbstractScrollSyncState {
   rowCount: number,
   columnCount: number,
   selectedRowIndex?: number,
   selectedColumnIndex?: number,
   scrollToColumn?: number,
   scrollToRow?: number,
}

export default abstract class AbstractScrollSync<P extends AbstractScrollSyncProps = AbstractScrollSyncProps, S extends AbstractScrollSyncState = AbstractScrollSyncState>
   extends React.PureComponent<P, S> implements MeasuredCellParent {

   private static defaultColumnWidth = 80;
   private static defaultRowHeight = 40;

   static defaultProps: Pick<AbstractScrollSyncProps,
      "showScrolling"
      | "columnWidth"
      | "rowCount"
      | "columnCount"
      | "height"
      | "overscanColumnCount"
      | "overscanRowCount"
      | "rowHeight"
      | "classes"> = {
         showScrolling: true,
         columnWidth: AbstractScrollSync.defaultColumnWidth,
         rowCount: 100,
         columnCount: 100,
         height: 500,
         overscanColumnCount: 0,
         overscanRowCount: 0,
         rowHeight: AbstractScrollSync.defaultRowHeight,
         classes: {
            ArrowKeyStepper: "ArrowKeyStepper",
            ScrollSyncContainer: "ScrollSyncContainer",
            HeaderBodyGridContainer: "HeaderBodyGridContainer",
            BodyGridContainer: "BodyGridContainer",
            BodyGrid: "BodyGrid",
            LeftHeaderGridContainer: "LeftHeaderGridContainer",
            LeftHeaderGrid: "LeftHeaderGrid",
            GridColumn: "GridColumn",
            GridRow: "GridRow",
            HeaderGridContainer: "HeaderGridContainer",
            HeaderGrid: "HeaderGrid",
            LeftSideGridContainer: "LeftSideGridContainer",
            LeftSideGrid: "LeftSideGrid",
            leftHeaderCell: "leftHeaderCell",
            headerCell: "headerCell",
            bodyCell: "bodyCell",
            leftSideCell: "leftSideCell",
            selectedRow: "selectedRow",
            evenRow: "evenRow",
            oddRow: "oddRow",
            selectedColumn: "selectedColumn",
            evenColumn: "evenColumn",
            oddColumn: "oddColumn"
         }
      };

   private readonly leftHeaderGrid: React.RefObject<Grid>;
   private readonly leftSideGrid: React.RefObject<Grid>;

   private readonly headerGrid: React.RefObject<Grid>;
   private readonly bodyGrid: React.RefObject<Grid>;

   private sectionRenderedParams: SectionRenderedParams;
   private _deferredInvalidateColumnIndex: number = null;
   private _deferredInvalidateRowIndex: number = null;

   protected constructor(props: P, context?: any) {
      super(props, context);

      this.leftHeaderGrid = React.createRef<Grid>();
      this.leftSideGrid = React.createRef<Grid>();

      this.headerGrid = React.createRef<Grid>();
      this.bodyGrid = React.createRef<Grid>();

      (this.state as AbstractScrollSyncState) = {
         rowCount: this.props.rowCount,
         columnCount: this.props.columnCount,
         scrollToRow: this.props.scrollToRow,
         scrollToColumn: this.props.scrollToColumn
      };
   }

   render() {

      return (
         <div className={this.props.classes.ScrollSyncContainer}>
            <ScrollSync>
               {(scrollSyncChildProps: ScrollSyncChildProps) => {
                  let leftSideGrid = this.getLeftSideGrid(scrollSyncChildProps);
                  return (
                     <div className={this.props.classes.GridRow} style={this._getGridRowStyle(scrollSyncChildProps)}>
                        {leftSideGrid}
                        <div className={this.props.classes.GridColumn} style={this._getGridColumnStyle(scrollSyncChildProps)}>
                           <AutoSizer disableHeight>
                              {({ width }) => (
                                 <div className={this.props.classes.HeaderBodyGridContainer}>
                                    {this.getHeaderGrid(scrollSyncChildProps, width)}
                                    {this.getBodyGrid(scrollSyncChildProps, width)}
                                 </div>
                              )}
                           </AutoSizer>
                        </div>
                     </div>
                  );
               }}
            </ScrollSync>
         </div>
      );
   }

   public componentDidMount(): void {
      this.handleInvalidatedGridSize();
   }

   public componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>): void {
      this.handleInvalidatedGridSize();
   }

   public handleInvalidatedGridSize() {

      if (this._deferredInvalidateColumnIndex !== null) {
         const columnIndex = this._deferredInvalidateColumnIndex;
         const rowIndex = this._deferredInvalidateRowIndex;

         this._deferredInvalidateColumnIndex = null;
         this._deferredInvalidateRowIndex = null;

         this.recomputeGridSize({ columnIndex, rowIndex });
      }
   }

   public invalidateCellSizeAfterRender(cellPosition: CellPosition): void {

      let { rowIndex, columnIndex } = cellPosition;

      if (this._deferredInvalidateColumnIndex === null)
         this._deferredInvalidateColumnIndex = columnIndex;
      else
         this._deferredInvalidateColumnIndex = Math.min(this._deferredInvalidateColumnIndex, columnIndex);

      if (this._deferredInvalidateRowIndex === null)
         this._deferredInvalidateRowIndex = rowIndex;
      else
         this._deferredInvalidateRowIndex = Math.min(this._deferredInvalidateRowIndex, rowIndex);
   }

   // noinspection JSUnusedGlobalSymbols
   public measureAllCells() {
      this.measureAllLeftHeaderGridCells();
      this.measureAllLeftSideGridCells();
      this.measureAllHeaderGridCells();
      this.measureAllBodyGridCells();
   }

   public measureAllLeftHeaderGridCells() {
      this.leftHeaderGrid?.current.measureAllCells();
   }

   public measureAllLeftSideGridCells() {
      this.leftSideGrid?.current.measureAllCells();
   }

   public measureAllHeaderGridCells() {
      this.headerGrid?.current.measureAllCells();
   }

   public measureAllBodyGridCells() {
      this.bodyGrid?.current.measureAllCells();
   }

   public recomputeGridSize(cellPosition?: Partial<CellPosition>) {
      this.recomputeLeftHeaderGridSize(cellPosition);
      this.recomputeLeftSideGridSize(cellPosition);
      this.recomputeHeaderGridSize(cellPosition);
      this.recomputeBodyGridSize(cellPosition);
      this.forceUpdate()
   }

   // noinspection JSUnusedGlobalSymbols
   public recomputeLeftHeaderGridSize(cellPosition?: Partial<CellPosition>) {
      this.leftHeaderGrid?.current.recomputeGridSize(cellPosition);
   }

   // noinspection JSUnusedGlobalSymbols
   public recomputeLeftSideGridSize(cellPosition?: Partial<CellPosition>) {
      this.leftSideGrid?.current.recomputeGridSize(cellPosition);
   }

   // noinspection JSUnusedGlobalSymbols
   public recomputeHeaderGridSize(cellPosition?: Partial<CellPosition>) {
      this.headerGrid?.current.recomputeGridSize(cellPosition);
   }

   // noinspection JSUnusedGlobalSymbols
   public recomputeBodyGridSize(cellPosition?: Partial<CellPosition>) {
      this.bodyGrid?.current.recomputeGridSize(cellPosition);
   }

   // noinspection JSUnusedGlobalSymbols
   public forceUpdateGrids() {
      this.forceUpdateLeftHeaderGrid();
      this.forceUpdateLeftSideGrid();
      this.forceUpdateHeaderGrid();
      this.forceUpdateBodyGrid();
   }

   public forceUpdateLeftHeaderGrid(callback?: () => void) {
      this.leftHeaderGrid?.current.forceUpdate(callback);
   }

   public forceUpdateLeftSideGrid(callback?: () => void) {
      this.leftSideGrid?.current.forceUpdate(callback);
   }

   public forceUpdateHeaderGrid(callback?: () => void) {
      this.headerGrid?.current.forceUpdate(callback);
   }

   public forceUpdateBodyGrid(callback?: () => void) {
      this.bodyGrid?.current.forceUpdate(callback);
   }

   // noinspection JSUnusedGlobalSymbols
   public getOffsetForCell(params?: { alignment?: Alignment } & Partial<CellPosition>): ScrollOffset {
      return this.bodyGrid?.current.getOffsetForCell(params);
   }

   // noinspection JSMethodCanBeStatic
   protected shouldFetchOverscan() {
      return false;
   }

   public getViewCoordinates() {

      let coordinates = this.getSectionRenderedSafeCoordinates();

      let columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex;

      if (this.shouldFetchOverscan()) {
         columnStartIndex = coordinates.columnOverscanStartIndex;
         columnStopIndex = coordinates.columnOverscanStopIndex;
         rowStartIndex = coordinates.rowOverscanStartIndex;
         rowStopIndex = coordinates.rowOverscanStopIndex;
      }
      else {
         columnStartIndex = coordinates.columnStartIndex;
         columnStopIndex = coordinates.columnStopIndex;
         rowStartIndex = coordinates.rowStartIndex;
         rowStopIndex = coordinates.rowStopIndex;
      }
      return { columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex };
   }

   public getSectionRenderedSafeCoordinates() {
      let sectionRenderedParams = this.getSectionRenderedParams();
      return {
         columnStartIndex: sectionRenderedParams?.columnStartIndex || 0,
         columnStopIndex: sectionRenderedParams?.columnStopIndex || 0,
         columnOverscanStartIndex: sectionRenderedParams?.columnOverscanStartIndex || 0,
         columnOverscanStopIndex: sectionRenderedParams?.columnOverscanStopIndex || 0,
         rowStartIndex: sectionRenderedParams?.rowStartIndex || 0,
         rowStopIndex: sectionRenderedParams?.rowStopIndex || 0,
         rowOverscanStartIndex: sectionRenderedParams?.rowOverscanStartIndex || 0,
         rowOverscanStopIndex: sectionRenderedParams?.rowOverscanStopIndex || 0
      };
   }

   // noinspection JSUnusedGlobalSymbols
   public scrollColumn(nbColumns: number) {
      let { columnStartIndex, columnStopIndex, rowStartIndex } = this.getSectionRenderedSafeCoordinates();
      let refColumnIndex = nbColumns > 0 ? columnStopIndex : columnStartIndex;
      this.scrollToCell({
         columnIndex: Math.min(this.props.columnCount, Math.max(0, refColumnIndex + nbColumns)),
         rowIndex: rowStartIndex
      });
   }

   // noinspection JSUnusedGlobalSymbols
   public scrollRow(nbRows: number) {
      let { columnStartIndex, rowStartIndex, rowStopIndex } = this.getSectionRenderedSafeCoordinates();
      let refRowIndex = nbRows > 0 ? rowStopIndex : rowStartIndex;
      this.scrollToCell({
         columnIndex: columnStartIndex,
         rowIndex: Math.min(this.props.rowCount, Math.max(0, refRowIndex + nbRows))
      });
   }

   public scrollToCell(params: CellPosition): void {
      this.bodyGrid?.current.scrollToCell(params);
   }

   // noinspection JSUnusedGlobalSymbols
   public scrollToPosition(params?: ScrollPosition): void {
      this.bodyGrid?.current.scrollToPosition(params);
   }

   private onBodySectionRendered = (params: SectionRenderedParams): any => {
      let init = !this.sectionRenderedParams;
      this.sectionRenderedParams = params;
      this.onSectionRendered(init);
   };

   private onScrollToChange = (params: ScrollIndices): any => {
      this.setState(params);
   };

   protected onSectionRendered(init: boolean) {
   }

   protected getSectionRenderedParams() {
      return this.sectionRenderedParams;
   }

   // noinspection FunctionWithMultipleReturnPointsJS
   private getAmount(amount: number | ((params: Index) => number), index: number, isColumn?: boolean): number {

      let defaultAmount = isColumn ? AbstractScrollSync.defaultColumnWidth : AbstractScrollSync.defaultRowHeight;

      if (amount === null || amount === undefined)
         return defaultAmount;

      if (isFunction(amount))
         return amount({ index }) || defaultAmount;

      return amount || defaultAmount;
   }

   public getRowHeight(index: number) {
      return this.getAmount(this.props.rowHeight, index);
   }

   public getColumnWidth(index: number) {
      return this.getAmount(this.props.columnWidth, index, true);
   }

   private getHeaderGrid(scrollSyncChildProps: ScrollSyncChildProps, width: number): React.ReactNode {

      let {
         columnWidth,
         overscanColumnCount,
         rowHeight,
         classes,
         deferredMeasurementCache
      } = this.props;

      let { columnCount } = this.state;

      let firstRowHeight = this.getRowHeight(0);

      return (
         <div
            className={classes.HeaderGridContainer}
            style={this._getHeaderStyle(scrollSyncChildProps, firstRowHeight, width)}>
            <Grid
               ref={this.headerGrid}
               className={classes.HeaderGrid}
               deferredMeasurementCache={deferredMeasurementCache}
               columnWidth={columnWidth}
               columnCount={columnCount}
               height={firstRowHeight}
               overscanColumnCount={overscanColumnCount}
               cellRenderer={this._renderHeaderCell}
               rowHeight={rowHeight}
               rowCount={1}
               scrollLeft={scrollSyncChildProps.scrollLeft}
               width={width - scrollbarSize()}
            />
         </div>
      );
   }

   private getBodyGrid(scrollSyncChildProps: ScrollSyncChildProps, width: number): React.ReactNode {

      let {
         arrowKeyStepper,
         columnWidth,
         height,
         overscanColumnCount,
         overscanRowCount,
         rowHeight,
         classes,
         deferredMeasurementCache,
         scrollToAlignment,
         scrollingResetTimeInterval,
         noContentRenderer,
         estimatedColumnSize,
         estimatedRowSize,
         containerProps,
         containerStyle,
         style,
         tabIndex,
      } = this.props;

      let {
         columnCount,
         rowCount,
         scrollToColumn,
         scrollToRow
      } = this.state;

      let innerGrid = (onSectionRendered: (params: RenderedSection) => void, scrollToColumn: number, scrollToRow: number) =>
         <Grid
            ref={this.bodyGrid}
            className={classes.BodyGrid}
            deferredMeasurementCache={deferredMeasurementCache}
            columnWidth={columnWidth}
            columnCount={columnCount}
            scrollToColumn={scrollToColumn}
            scrollToRow={scrollToRow}
            scrollingResetTimeInterval={scrollingResetTimeInterval}
            noContentRenderer={noContentRenderer}
            estimatedColumnSize={estimatedColumnSize}
            estimatedRowSize={estimatedRowSize}
            height={height}
            containerProps={containerProps}
            containerStyle={containerStyle}
            scrollToAlignment={scrollToAlignment}
            style={style}
            tabIndex={tabIndex}
            onScroll={(scrollParams: ScrollParams) => scrollSyncChildProps.onScroll(scrollParams)}
            onSectionRendered={(params: SectionRenderedParams) => {
               this.onBodySectionRendered(params);
               if (onSectionRendered)
                  onSectionRendered(params);
            }}
            overscanColumnCount={overscanColumnCount}
            overscanRowCount={overscanRowCount}
            cellRenderer={this._renderBodyCell}
            rowHeight={rowHeight}
            rowCount={rowCount}
            width={width}
         />;

      return (
         <div
            className={classes.BodyGridContainer}
            style={this._getBodyStyle(scrollSyncChildProps, height, width)}> {
               arrowKeyStepper
                  ?
                  <ArrowKeyStepper
                     mode={arrowKeyStepper}
                     className={classes.ArrowKeyStepper}
                     isControlled={true}
                     onScrollToChange={this.onScrollToChange}
                     scrollToColumn={scrollToColumn}
                     scrollToRow={scrollToRow}
                     columnCount={columnCount}
                     rowCount={rowCount}>
                     {({ onSectionRendered, scrollToColumn, scrollToRow }) =>
                        innerGrid(onSectionRendered, scrollToColumn, scrollToRow)}
                  </ArrowKeyStepper>
                  :
                  innerGrid(null, scrollToColumn, scrollToRow)
            }
         </div>
      );
   }

   private getLeftSideGrid(scrollSyncChildProps: ScrollSyncChildProps): React.ReactNode {

      let {
         height,
         overscanColumnCount,
         overscanRowCount,
         columnWidth,
         rowHeight,
         classes,
         deferredMeasurementCache
      } = this.props;

      let leftSideGridContainerStyle = this._getLeftSideGridContainerStyle(scrollSyncChildProps);

      let firstColumnWidth = this.getColumnWidth(0);

      let leftHeaderGrid = this.getLeftHeaderGrid(scrollSyncChildProps, leftSideGridContainerStyle, firstColumnWidth);

      return (
         <>
            {leftHeaderGrid}
            <div
               className={classes.LeftSideGridContainer}
               style={{ ...leftSideGridContainerStyle, ...this._getLeftSideStyle(scrollSyncChildProps) }}>
               <Grid
                  ref={this.leftSideGrid}
                  className={classes.LeftSideGrid}
                  deferredMeasurementCache={deferredMeasurementCache}
                  overscanColumnCount={overscanColumnCount}
                  overscanRowCount={overscanRowCount}
                  cellRenderer={this._renderLeftSideCell}
                  columnWidth={columnWidth}
                  columnCount={1}
                  height={height - scrollbarSize()}
                  rowHeight={rowHeight}
                  rowCount={this.state.rowCount}
                  scrollTop={scrollSyncChildProps.scrollTop}
                  width={firstColumnWidth}
               />
            </div>
         </>
      );
   }

   private getLeftHeaderGrid(scrollSyncChildProps: ScrollSyncChildProps, leftSideGridContainerStyle: CSSProperties, firstColumnWidth: number): React.ReactNode {

      let { rowHeight, classes, deferredMeasurementCache } = this.props;

      let firstRowHeight = this.getRowHeight(0);

      return (
         <div
            className={classes.LeftHeaderGridContainer}
            style={{ ...leftSideGridContainerStyle, ...this._getLeftHeaderStyle(scrollSyncChildProps) }}>
            <Grid
               ref={this.leftHeaderGrid}
               className={classes.LeftHeaderGrid}
               deferredMeasurementCache={deferredMeasurementCache}
               cellRenderer={this._renderLeftHeaderCell}
               width={firstColumnWidth}
               height={firstRowHeight}
               rowHeight={rowHeight}
               columnWidth={firstColumnWidth}
               rowCount={1}
               columnCount={1}
            />
         </div>
      );
   }

   // noinspection FunctionWithMultipleReturnPointsJS
   public shouldRenderBodyCell({ rowIndex, columnIndex }: CellPosition) {

      if (this.leftHeaderGrid && columnIndex === 0 && rowIndex === 0)
         return false;
      else
         // noinspection OverlyComplexBooleanExpressionJS
         if ((this.headerGrid && columnIndex === 0)
            || (this.leftSideGrid && rowIndex === 0))
            return false;

      return true
   }

   // noinspection FunctionWithInconsistentReturnsJS, FunctionWithMultipleReturnPointsJS
   private _renderBodyCell = (gridCellProps: GridCellProps): React.ReactNode => {

      if (!this.shouldRenderBodyCell(gridCellProps))
         return null;

      return this.renderBodyCell(gridCellProps);
   };

   protected renderBodyCell(gridCellProps: GridCellProps): React.ReactNode {
      return this.renderLeftSideCell(gridCellProps);
   }

   // noinspection JSUnusedGlobalSymbols
   public shouldRenderHeaderCell(columnIndex: number) {
      return !((this.leftHeaderGrid || this.leftSideGrid) && columnIndex === 0);
   }

   // noinspection FunctionWithInconsistentReturnsJS, FunctionWithMultipleReturnPointsJS
   private _renderHeaderCell = (gridCellProps: GridCellProps): React.ReactNode => {

      if (!this.shouldRenderHeaderCell(gridCellProps.columnIndex))
         return null;

      return this.renderHeaderCell(gridCellProps);
   };

   protected renderHeaderCell(gridCellProps: GridCellProps): React.ReactNode {
      return this.renderLeftHeaderCell(gridCellProps);
   }

   private _renderLeftHeaderCell = (gridCellProps: GridCellProps): React.ReactNode => {
      return this.renderLeftHeaderCell(gridCellProps);
   };

   protected renderLeftHeaderCell(gridCellProps: GridCellProps): React.ReactNode {

      let { showScrolling, classes } = this.props;
      let { key, style, columnIndex, isScrolling } = gridCellProps;

      return (
         <div className={classes.leftHeaderCell} key={key} style={style}>
            {showScrolling && isScrolling ? "..." : `C${columnIndex}`}
         </div>
      );
   }

   public shouldRenderLeftSideCell(rowIndex: number) {
      return !((this.leftHeaderGrid || this.headerGrid) && rowIndex === 0);
   }

   // noinspection FunctionWithMultipleReturnPointsJS
   private _renderLeftSideCell = (gridCellProps: GridCellProps): React.ReactNode => {

      if (!this.shouldRenderLeftSideCell(gridCellProps.rowIndex))
         return null;

      return this.renderLeftSideCell(gridCellProps);
   };

   protected renderLeftSideCell(gridCellProps: GridCellProps): React.ReactNode {

      let { showScrolling, classes } = this.props;
      let { columnIndex, key, rowIndex, style, isScrolling } = gridCellProps;

      return (
         <div className={classNames(AbstractScrollSync.getClassNames({ classes, rowIndex, columnIndex }))} key={key}
            style={style}>
            {showScrolling && isScrolling ? "..." : `R${rowIndex}, C${columnIndex}`}
         </div>
      );
   }

   private _getLeftHeaderStyle(props: ScrollSyncChildProps): CSSProperties {
      return {
         ...this.getLeftHeaderStyle(props),
         position: 'absolute',
         left: 0,
         top: 0,
         zIndex: 2
      };
   }

   // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
   protected getLeftHeaderStyle(props: ScrollSyncChildProps): CSSProperties {
      return {};
   }

   private _getLeftSideStyle(props: ScrollSyncChildProps): CSSProperties {
      return {
         ...this.getLeftSideStyle(props),
         position: 'absolute',
         left: 0,
         top: 0,
         zIndex: 1
      };
   }

   // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
   protected getLeftSideStyle(props: ScrollSyncChildProps): CSSProperties {
      return {};
   }

   private _getHeaderStyle(props: ScrollSyncChildProps, height: number, width: number): CSSProperties {
      return {
         ...this.getHeaderStyle(props, height, width),
         position: 'absolute',
         zIndex: 1,
         left: 0,
         top: 0,
         height: height,
         width: width - scrollbarSize(),
      };
   }

   // noinspection JSUnusedLocalSymbols
   protected getHeaderStyle(props: ScrollSyncChildProps, height: number, width: number): CSSProperties {
      return {};
   }

   private _getBodyStyle(props: ScrollSyncChildProps, height: number, width: number): CSSProperties {
      return {
         ...this.getBodyStyle(props, height, width),
         height,
         width,
      };
   }

   // noinspection JSUnusedLocalSymbols
   protected getBodyStyle(props: ScrollSyncChildProps, height: number, width: number): CSSProperties {
      return {};
   }

   private _getGridRowStyle(props: ScrollSyncChildProps): CSSProperties {
      return {
         ...this.getGridRowStyle(props),
         position: 'relative',
         display: 'flex',
         flexDirection: 'row'
      };
   }

   // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
   protected getGridRowStyle(props: ScrollSyncChildProps): CSSProperties {
      return {};
   }

   private _getLeftSideGridContainerStyle(props: ScrollSyncChildProps): CSSProperties {
      return {
         ...this.getLeftSideGridContainerStyle(props),
         backgroundColor: 'white'
      };
   }

   // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
   protected getLeftSideGridContainerStyle(props: ScrollSyncChildProps): CSSProperties {
      return {};
   }

   private _getGridColumnStyle(props: ScrollSyncChildProps): CSSProperties {
      return {
         ...this.getGridColumnStyle(props),
         display: 'flex',
         flexDirection: 'column',
         flex: '1 1 auto',
      };
   }

   // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
   protected getGridColumnStyle(props: ScrollSyncChildProps): CSSProperties {
      return {};
   }

   // noinspection OverlyComplexFunctionJS
   public static getClassNames({
      classes,
      rowIndex,
      columnIndex,
      handleMouseEnter,
      highlightSelectedRow,
      highlightSelectedColumn,
      selectedRowIndex,
      selectedColumnIndex
   }: ClassNameParams): Partial<Record<ClassKey, boolean>> {
      // noinspection NestedConditionalExpressionJS, NegatedConditionalExpressionJS
      let evenRow = rowIndex % 2 === 0;
      let evenColumn = columnIndex % 2 === 0;
      return {
         [classes.selectedRow]: handleMouseEnter && highlightSelectedRow && selectedRowIndex === rowIndex,
         [classes.evenRow]: evenRow,
         [classes.oddRow]: !evenRow,
         [classes.selectedColumn]: handleMouseEnter && highlightSelectedColumn && selectedColumnIndex === columnIndex,
         [classes.evenColumn]: evenColumn,
         [classes.oddColumn]: !evenColumn
      };
   }

   public isLeftHeader(grid: MeasuredCellParent) {
      return grid === this.leftHeaderGrid?.current;
   }

   public isLeftSide(grid: MeasuredCellParent) {
      return grid === this.leftSideGrid?.current;
   }

   public isHeader(grid: MeasuredCellParent) {
      return grid === this.headerGrid?.current;
   }

   public isBody(grid: MeasuredCellParent) {
      return grid === this.bodyGrid?.current;
   }
}