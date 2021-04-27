/**
 * @author SYESILDAG
 *
 */
import classNames from 'classnames';
import * as moment from 'moment';
import * as React from 'react';
import { MouseEvent } from 'react';
import { CellMeasurer, GridCellProps } from 'react-virtualized';
import { CellMeasurerCache, CellPosition } from 'react-virtualized/dist/es/CellMeasurer';

import { GenericFactory } from '../../lib/src/utils/genericFactory';
import { debounce, DebouncedFunction, nextUid } from '../../lib/src/utils/utils';
import AbstractGridReactNodeRenderer from './abstractGridReactNodeRenderer';
import AbstractGridScrollSync, { GridReactNodeProvider, Key } from './abstractGridScrollSync';
import AbstractScrollSync from './abstractScrollSync';
import { AsyncTaskDoneWithStats, ConcurrentExecutorOptions, Parallel } from './asyncIterator';
import { DefaultReactNodeRenderer } from './defaultReactNodeRenderer';

export interface Measurer {
  measure: () => void
}

export interface ContentGetter {
  (measurer: Measurer): React.ReactNode
}

export type IndexSet = Set<number>;
//row -> column set
export type IndexGrid = Map<number, IndexSet>;

export type RemoteCallFunction<T = any,
  R extends RowCellData<T> = RowCellData<T>,
  C extends ColumnCellData<T> = ColumnCellData<T>,
  G extends GridCellData<T> = GridCellData<T>,
  D = RemoteCallData> = (arg: RemoteCall<D>) => Promise<RemoteCallResponse<T, R, C, G>>;

export interface BaseCellData<T = any> {
  cellType?: T;
}

export interface CellData<T = any> extends BaseCellData<T> {
  id?: string;
  colspanCellData?: CellData<T>;
  rowIndex?: number;
  columnIndex?: number;
  content?: string;
  className?: string;
  refresh?: boolean;
  colspan?: number;
  sBGColor?: string;
}

export interface RowCellData<T = any> extends CellData<T> {
}

export interface ColumnCellData<T = any> extends CellData<T> {
}

export interface GridCellData<T = any> extends CellData<T> {
}

export interface RemoteCallData {
}

// noinspection JSUnusedGlobalSymbols
export interface RemoteCall<D = RemoteCallData> {
  token: string;
  init: boolean;
  data: D;
  leftHeader: boolean;
  sideIndexSet?: Array<number>;
  headerIndexSet?: Array<number>;
  indexGrid?: Record<number, Array<number>>;
}

export interface RemoteCallResponse<T = any,
  R extends RowCellData<T> = RowCellData<T>,
  C extends ColumnCellData<T> = ColumnCellData<T>,
  G extends GridCellData<T> = GridCellData<T>> {
  token: string;
  leftHeaderCellValue: C,
  //column -> value
  sideCellValues?: Record<number, R>;
  //row -> value
  headerCellValues?: Record<number, C>;
  //row -> column -> value
  gridCellValues?: Record<number, Record<number, G>>;
}

export interface State<T = any,
  R extends RowCellData<T> = RowCellData<T>,
  C extends ColumnCellData<T> = ColumnCellData<T>,
  G extends GridCellData<T> = GridCellData<T>> {
  leftHeaderCell: C;
  sideCells: Map<number, R>;
  headerCells: Map<number, C>;
  gridCells: Map<number, Map<number, G>>;
}

// noinspection JSUnusedGlobalSymbols
export default abstract class AbstractGridReactNodeProvider<S extends AbstractGridScrollSync = AbstractGridScrollSync,
  T = any,
  R extends RowCellData<T> = RowCellData<T>,
  C extends ColumnCellData<T> = ColumnCellData<T>,
  G extends GridCellData<T> = GridCellData<T>,
  D extends RemoteCallData = RemoteCallData>
  implements GridReactNodeProvider {

  //row index set
  private requestAllSideCells: IndexSet = new Set<number>();
  //row column set
  private requestAllHeaderCells: IndexSet = new Set<number>();
  //row column indexes
  private requestAllGridCells: IndexGrid = new Map<number, IndexSet>();

  private requestLeftHeaderCell: boolean = false;

  //token -> row
  private requestSideCells: Map<string, IndexSet> = new Map<string, IndexSet>();
  //token -> column
  private requestHeaderCells: Map<string, IndexSet> = new Map<string, IndexSet>();
  //token -> row -> column
  private requestGridCells: Map<string, IndexGrid> = new Map<string, IndexGrid>();

  private state: State<T, R, C, G>;

  private readonly updateMouseEnterDebounced: DebouncedFunction<number>;

  private readonly checkForMissingCellsDebounced: DebouncedFunction<boolean>;

  private token: string;

  private remoteCallFunction: RemoteCallFunction<T, R, C, G, D>;

  private factory: GenericFactory.Base<T, AbstractGridReactNodeRenderer<S, T>, S> = null;

  private readonly parallel: Parallel = null;

  protected constructor(protected scrollSync: S) {

    if (this.shouldHandleMouseEnter())
      this.updateMouseEnterDebounced = debounce<number>(this.updateMouseEnter, this.getOnMouseEnterDebounceTimeout());

    // noinspection MagicNumberJS
    this.checkForMissingCellsDebounced = debounce<boolean>(this.checkForMissingCells, this.getScrollDebounceTimeout());

    this.remoteCallFunction = this.getRemoteCallFunction();

    this.parallel = new Parallel();

    this.parallel.setOptions(this.getConcurrentExecutorOptions());

    //initialize token
    this.token = nextUid();

    this.state = {
      leftHeaderCell: null,
      sideCells: new Map<number, R>(),
      headerCells: new Map<number, C>(),
      gridCells: new Map<number, Map<number, G>>()
    };
  }

  updateCellData(gridCellProps: GridCellProps, key: Key, value: any, clearCache: boolean) {

    if (clearCache && this.scrollSync.props.deferredMeasurementCache)
      this.scrollSync.props.deferredMeasurementCache.clear(gridCellProps.rowIndex, gridCellProps.columnIndex);

    // noinspection IfStatementWithTooManyBranchesJS
    if (this.scrollSync.isBody(gridCellProps.parent)) {
      this.updateBodyCellData(gridCellProps, key, value);
      this.scrollSync.forceUpdateBodyGrid();
    }
    else if (this.scrollSync.isHeader(gridCellProps.parent)) {
      this.updateHeaderCellData(gridCellProps, key, value);
      this.scrollSync.forceUpdateHeaderGrid();
    }
    else if (this.scrollSync.isLeftHeader(gridCellProps.parent)) {
      this.updateLeftHeaderCellData(key, value);
      this.scrollSync.forceUpdateLeftHeaderGrid();
    }
    else if (this.scrollSync.isLeftSide(gridCellProps.parent)) {
      this.updateLeftSideCellData(gridCellProps, key, value);
      this.scrollSync.forceUpdateLeftSideGrid();
    }

    this.scrollSync.handleInvalidatedGridSize();
  }

  // noinspection JSUnusedGlobalSymbols
  public invalidateCellData(gridCellProps: GridCellProps, key: Key) {
    this.updateCellData(gridCellProps, key, null, true);
  }

  private updateBodyCellData(gridCellProps: CellPosition, key: Key, value: any): void {
    let {rowIndex, columnIndex} = gridCellProps;
    let columnValues: Map<number, G> = this.state.gridCells.get(rowIndex);
    if (columnValues) {
      this.state = {...this.state};
      this.state.gridCells = new Map(this.state.gridCells);
      columnValues = new Map(columnValues);
      this.state.gridCells.set(rowIndex, columnValues);
      let gridCellValue: G = columnValues.get(columnIndex);
      if (gridCellValue)
        columnValues.set(columnIndex, {...gridCellValue, ...{[key]: value}});
    }
  }

  private updateHeaderCellData(gridCellProps: CellPosition, key: Key, value: any): void {
    let {columnIndex} = gridCellProps;
    let headerCellValue: C = this.state.headerCells.get(columnIndex);
    if (headerCellValue) {
      this.state = {...this.state};
      this.state.headerCells = new Map(this.state.headerCells);
      this.state.headerCells.set(columnIndex, {...headerCellValue, ...{[key]: value}});
    }
  }

  private updateLeftSideCellData(gridCellProps: CellPosition, key: Key, value: any): void {
    let {rowIndex} = gridCellProps;
    let sideCellValue: R = this.state.sideCells.get(rowIndex);
    if (sideCellValue) {
      this.state = {...this.state};
      this.state.sideCells = new Map(this.state.sideCells);
      this.state.sideCells.set(rowIndex, {...sideCellValue, ...{[key]: value}});
    }
  }

  private updateLeftHeaderCellData(key: Key, value: any): void {
    if (this.state.leftHeaderCell) {
      this.state = {...this.state};
      this.state.leftHeaderCell = {...this.state.leftHeaderCell, ...{[key]: value}};
    }
  }

  // noinspection JSMethodCanBeStatic
  protected getOnMouseEnterDebounceTimeout(): number {
    // noinspection MagicNumberJS
    return 100;
  }

  // noinspection JSMethodCanBeStatic
  protected getScrollDebounceTimeout(): number {
    // noinspection MagicNumberJS
    return 200;
  }

  // noinspection JSMethodCanBeStatic
  protected getConcurrentExecutorOptions(): ConcurrentExecutorOptions {
    return null;
  }

  // noinspection JSUnusedGlobalSymbols
  public static getIndexGridRecord<T, G extends GridCellData<T>>(gridCells: Map<number, Map<number, G>>, filter?: (grid: G) => Partial<G>) {
    let indexGridRecord: Record<number, Record<number, Partial<G>>> = {};
    gridCells.forEach((columnValues: Map<number, G>, rowIndex: number) => {
      let columnRecord: Record<number, Partial<G>> = {};
      columnValues.forEach((data: G, columnIndex: number) => {
        // noinspection BadExpressionStatementJS, UnnecessaryLocalVariableJS
        let partialData = filter ? filter(data) : data;
        if (partialData)
        // noinspection ReuseOfLocalVariableJS
          columnRecord[columnIndex] = partialData;
      });
      if (Object.keys(columnRecord).length > 0)
        indexGridRecord[rowIndex] = columnRecord;
    });
    return indexGridRecord;
  }

  // noinspection JSUnusedGlobalSymbols
  public getGridCells() {
    return this.state.gridCells;
  }

  private getFactory() {
    if (this.factory === null)
      this.factory = new GenericFactory.Base<T, AbstractGridReactNodeRenderer<S, T>, S>(...this.getReactNodeRenderers());
    return this.factory;
  }

  protected getReactNodeRenderers(): Array<GenericFactory.Constructor<T, AbstractGridReactNodeRenderer<S, T>, S>> {
    return [];
  }

  protected getDefaultReactNodeRenderer(): GenericFactory.Constructor<T, AbstractGridReactNodeRenderer<S, T>, S> {
    return DefaultReactNodeRenderer;
  }

  protected getRemoteCallFunction(): RemoteCallFunction<T, R, C, G, D> {
    return (remoteCall: RemoteCall<D>) => {
      return new Promise<RemoteCallResponse<T, R, C, G>>((resolve, reject) => {
        let asyncTask: AsyncTaskDoneWithStats = {
          context: this,
          promise(this: AbstractGridReactNodeProvider) {
            return new Promise<RemoteCallResponse<T, R, C, G>>(this.remoteCall.bind(this, remoteCall))
          },
          done(this: AbstractGridReactNodeProvider, response: RemoteCallResponse<T, R, C, G>) {
            if (this.shouldDebug())
              console.log([
                "remote", remoteCall,
                "response", response,
                "duration", {
                  "wait": moment.duration({from: asyncTask.begin, to: asyncTask.start}),
                  "process": moment.duration({from: asyncTask.start, to: asyncTask.end}),
                }]);
            resolve(response);
          },
          fail(this: AbstractGridReactNodeProvider, ex: any) {
            reject(ex);
          }
        };
        this.parallel.submit(asyncTask)
      });
    };
    //return (remoteCall: RemoteCall<D>) => new Promise<RemoteCallResponse<T, R, C, G>>(this.remoteCall.bind(this, remoteCall));
  }

  protected abstract remoteCall(remoteCall: RemoteCall<D>, resolve: (value?: RemoteCallResponse<T, R, C, G> | PromiseLike<RemoteCallResponse<T, R, C, G>>) => void, reject: (reason?: any) => void): void;

  protected abstract getRemoteCallData(): D;

  // noinspection JSUnusedLocalSymbols
  protected onRequest(remoteCall: RemoteCall<D>) {
  }

  // noinspection JSUnusedLocalSymbols
  protected onResponse(response: RemoteCallResponse<T, R, C, G>) {
  }

  // noinspection JSUnusedLocalSymbols, JSMethodCanBeStatic
  protected onError(error: any) {
    throw error;
  }

  private render(props: GridCellProps, cellData: CellData<T>, measurer: Measurer) {
    let reactNodeRenderer = this.getReactNodeRenderer(cellData);
    return reactNodeRenderer.render(props, cellData, measurer)
  }

  public getReactNodeRenderer(cellData: CellData<T>): AbstractGridReactNodeRenderer<S, T> {
    // noinspection EqualityComparisonWithCoercionJS
    let reactNodeRenderer = cellData?.cellType == null ? null : this.getFactory().create(cellData.cellType, this.scrollSync);

    if (!reactNodeRenderer)
      reactNodeRenderer = new (this.getDefaultReactNodeRenderer())(this.scrollSync);

    return reactNodeRenderer;
  }

// noinspection JSUnusedGlobalSymbols
  protected shouldDebug() {
    return false;
  }

  public static isMultiSpan(cellData: CellData) {
    return cellData && cellData.colspan > 1;
  }

  // noinspection FunctionWithMoreThanThreeNegationsJS
  protected shouldRemoteCall(requestLeftHeaderCell: boolean, sideIndexSet: IndexSet, headerIndexSet: IndexSet, indexGrid: IndexGrid): boolean {
    // noinspection OverlyComplexBooleanExpressionJS
    return requestLeftHeaderCell || !!sideIndexSet || !!headerIndexSet || !!indexGrid;
  }

  // noinspection JSMethodCanBeStatic, FunctionWithMoreThanThreeNegationsJS, FunctionWithMultipleLoopsJS, OverlyComplexFunctionJS, FunctionTooLongJS
  private checkForMissingCells(init: boolean) {

    let {
      columnStartIndex,
      columnStopIndex,
      rowStartIndex,
      rowStopIndex
    } = this.scrollSync.getViewCoordinates();

    if (this.shouldDebug())
      console.log(["checkForMissingCells", this.token, {
        init,
        columnStartIndex,
        columnStopIndex,
        rowStartIndex,
        rowStopIndex
      }]);

    if (!this.state.leftHeaderCell)
      this.requestLeftHeaderCell = true;

    let sideIndexSet: IndexSet = null;

    for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
      if (this.scrollSync.shouldRenderLeftSideCell(rowIndex) && !this.state.sideCells.get(rowIndex) && !this.requestAllSideCells.has(rowIndex)) {
        // noinspection EqualityComparisonWithCoercionJS
        if (sideIndexSet == null) {
          sideIndexSet = new Set<number>();
          this.requestSideCells.set(this.token, sideIndexSet);
        }
        sideIndexSet.add(rowIndex);
        this.requestAllSideCells.add(rowIndex);
      }
    }

    let headerIndexSet: IndexSet = null;

    for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
      if (this.scrollSync.shouldRenderHeaderCell(columnIndex) && !this.state.headerCells.get(columnIndex) && !this.requestAllHeaderCells.has(columnIndex)) {
        // noinspection EqualityComparisonWithCoercionJS
        if (headerIndexSet == null) {
          headerIndexSet = new Set<number>();
          this.requestHeaderCells.set(this.token, headerIndexSet);
        }
        headerIndexSet.add(columnIndex);
        this.requestAllHeaderCells.add(columnIndex);
      }
    }

    let indexGrid: IndexGrid = null;

    for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
      for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
        if (this.scrollSync.shouldRenderBodyCell({rowIndex, columnIndex})
          && !this.state.gridCells.get(rowIndex)?.get(columnIndex)
          && !this.requestAllGridCells.get(rowIndex)?.has(columnIndex)) {
          // noinspection EqualityComparisonWithCoercionJS
          if (indexGrid == null) {
            // noinspection ReuseOfLocalVariableJS
            indexGrid = new Map<number, Set<number>>();
            this.requestGridCells.set(this.token, indexGrid);
          }

          let columnIndexes = indexGrid.get(rowIndex);
          // noinspection EqualityComparisonWithCoercionJS
          if (columnIndexes == null) {
            columnIndexes = new Set<number>();
            indexGrid.set(rowIndex, columnIndexes);
          }

          columnIndexes.add(columnIndex);

          let allGridColumnIndexes: IndexSet = this.requestAllGridCells.get(rowIndex);

          // noinspection EqualityComparisonWithCoercionJS
          if (allGridColumnIndexes == null) {
            allGridColumnIndexes = new Set<number>();
            this.requestAllGridCells.set(rowIndex, allGridColumnIndexes);
          }

          allGridColumnIndexes.add(columnIndex);
        }
      }
    }

    let remoteCall: RemoteCall<D> = {
      token: this.token,
      init,
      data: this.getRemoteCallData(),
      leftHeader: this.requestLeftHeaderCell
    };

    if (sideIndexSet)
      remoteCall.sideIndexSet = Array.from(sideIndexSet);

    if (headerIndexSet)
      remoteCall.headerIndexSet = Array.from(headerIndexSet);

    if (indexGrid) {
      let indexGridRecord: Record<number, Array<number>> = {};
      indexGrid.forEach((columnIndexes: IndexSet, rowIndex) => {
        indexGridRecord[rowIndex] = Array.from(columnIndexes);
      });
      remoteCall.indexGrid = indexGridRecord;
    }

    if (this.shouldRemoteCall(this.requestLeftHeaderCell, sideIndexSet, headerIndexSet, indexGrid)) {

      if (this.shouldDebug())
        console.log(["request", {
          requestLeftHeaderCell: this.requestLeftHeaderCell,
          sideIndexSet,
          headerIndexSet,
          indexGrid
        }]);

      this.onRequest(remoteCall);

      let promise: Promise<RemoteCallResponse<T, R, C, G>> = this.remoteCallFunction.call(this, remoteCall);

      // noinspection FunctionWithMultipleLoopsJS, OverlyComplexFunctionJS, FunctionTooLongJS
      promise.then((response: RemoteCallResponse<T, R, C, G>) => {

          let token = response.token;

          // noinspection EqualityComparisonWithCoercionJS
          if (response.leftHeaderCellValue != null) {
            this.state.leftHeaderCell = response.leftHeaderCellValue;
            this.requestLeftHeaderCell = false;
          }

          //update side cell data
          if (response.sideCellValues)
            Object.keys(response.sideCellValues).forEach(rowIndex =>
              this.state.sideCells.set(+rowIndex, response.sideCellValues[+rowIndex])
            );

          //update header cell data
          if (response.headerCellValues)
            Object.keys(response.headerCellValues).forEach(columnIndex =>
              this.state.headerCells.set(+columnIndex, response.headerCellValues[+columnIndex])
            );

          //update grid cell data
          if (response.gridCellValues) {
            Object.keys(response.gridCellValues).forEach(rowIndex => {
              let responseColumnGridCells = response.gridCellValues[+rowIndex];
              if (responseColumnGridCells) {
                Object.keys(responseColumnGridCells).forEach(columnIndex => {
                  let responseGridCell = responseColumnGridCells[+columnIndex];
                  let columnGridCells = this.state.gridCells.get(+rowIndex);
                  // noinspection EqualityComparisonWithCoercionJS
                  if (columnGridCells == null) {
                    // noinspection ReuseOfLocalVariableJS
                    columnGridCells = new Map<number, G>();
                    this.state.gridCells.set(+rowIndex, columnGridCells);
                  }
                  responseGridCell.rowIndex = +rowIndex;
                  responseGridCell.columnIndex = +columnIndex;
                  columnGridCells.set(+columnIndex, responseGridCell);
                });
              }
            });
          }

          this.state.gridCells.forEach((columnValues: Map<number, G>) => {
            columnValues.forEach((data: G, columnIndex: number) => {
              if (AbstractGridReactNodeProvider.isMultiSpan(data)) {
                for (let i = 1; i < data.colspan; i++) {
                  let nextColumnValue: GridCellData<T> = columnValues.get(columnIndex + i);
                  if (nextColumnValue)
                    nextColumnValue.colspanCellData = data;
                }
              }
            });
          });

          //clear all requested values
          this.requestSideCells.get(token)?.forEach(rowIndex =>
            this.requestAllSideCells.delete(rowIndex)
          );

          this.requestHeaderCells.get(token)?.forEach(columnIndex =>
            this.requestAllHeaderCells.delete(columnIndex)
          );

          this.requestGridCells.get(token)?.forEach((columnIndexes: IndexSet, rowIndex) => {
            let allGridColumnIndexes = this.requestAllGridCells.get(rowIndex);
            if (allGridColumnIndexes) {
              for (const columnIndex of columnIndexes)
                allGridColumnIndexes.delete(columnIndex);
              // noinspection EqualityComparisonWithCoercionJS
              if (allGridColumnIndexes.size == 0)
                this.requestAllGridCells.delete(rowIndex);
            }
          });

          //clear requested values
          this.requestSideCells.delete(token);
          this.requestHeaderCells.delete(token);
          this.requestGridCells.delete(token);

          if (response.leftHeaderCellValue)
            this.scrollSync.forceUpdateLeftHeaderGrid();

          if (response.sideCellValues)
            this.scrollSync.forceUpdateLeftSideGrid();

          if (response.headerCellValues)
            this.scrollSync.forceUpdateHeaderGrid();

          if (response.gridCellValues)
            this.scrollSync.forceUpdateBodyGrid();

          this.scrollSync.handleInvalidatedGridSize();

          if (response.sideCellValues && response.headerCellValues) {

            let responseRowCount = Object.keys(response.sideCellValues).length;
            let responseColumnCount = Object.keys(response.headerCellValues).length;

            if (this.scrollSync.state.rowCount < responseRowCount || this.scrollSync.state.columnCount < responseColumnCount) {

              if (this.scrollSync.props.deferredMeasurementCache)
                this.cacheClearAll(this.scrollSync.props.deferredMeasurementCache);

              this.scrollSync.setState({
                rowCount: Math.max(this.scrollSync.state.rowCount, responseRowCount + (this.scrollSync.shouldRenderLeftSideCell(0) ? 0 : 1)),
                columnCount: Math.max(this.scrollSync.state.columnCount, responseColumnCount + (this.scrollSync.shouldRenderHeaderCell(0) ? 0 : 1))
              });
            }
          }

          this.onResponse(response);
        },
        (error: any) => {
          this.onError(error);
        }
      );

      //update token
      this.token = nextUid();
    }

    this.scrollSync.handleInvalidatedGridSize();
  }

  // noinspection JSMethodCanBeStatic
  protected cacheClearAll(cache: CellMeasurerCache) {
    cache.clearAll();
  }

  // noinspection JSUnusedGlobalSymbols
  protected shouldHandleMouseEnter() {
    return false;
  }

  // noinspection JSMethodCanBeStatic
  protected shouldHighlightSelectedRow() {
    return true;
  }

  // noinspection JSMethodCanBeStatic
  protected shouldHighlightSelectedColumn() {
    return true;
  }

  private updateMouseEnter(rowIndex: number, columnIndex: number) {
    this.scrollSync.setState({
      selectedRowIndex: rowIndex,
      selectedColumnIndex: columnIndex
    });
    this.scrollSync.forceUpdateHeaderGrid();
    this.scrollSync.forceUpdateLeftSideGrid();
  }

  // noinspection JSUnusedLocalSymbols
  protected onMouseEnter = (rowIndex: number, columnIndex: number) => (e: MouseEvent<HTMLSpanElement>) => {
    this.updateMouseEnterDebounced(rowIndex, columnIndex);
  };

  private renderCell(props: GridCellProps, cellData: R | C | G, contentGetter: ContentGetter): React.ReactNode {
    let cache = this.scrollSync.props.deferredMeasurementCache;
    return (cache && cellData) ?
      <CellMeasurer
        cache={cache}
        columnIndex={props.columnIndex}
        key={props.key}
        parent={this.scrollSync}
        rowIndex={props.rowIndex}>
        {contentGetter}
      </CellMeasurer> : contentGetter(null);
  }

  public renderLeftHeaderCell(gridCellProps: GridCellProps): React.ReactNode {

    let {classes} = this.scrollSync.props;
    let {key, style, rowIndex, columnIndex} = gridCellProps;

    let cellData: C = this.state.leftHeaderCell;

    return this.renderCell(gridCellProps, cellData, measurer => {
      return (
        <span
          className={classNames(classes.leftHeaderCell, AbstractScrollSync.getClassNames({
            classes,
            rowIndex,
            columnIndex
          }))}
          key={key} style={style}>
          {this.render(gridCellProps, cellData, measurer)}
        </span>
      );
    });
  }

  public renderHeaderCell(gridCellProps: GridCellProps): React.ReactNode {

    let {classes} = this.scrollSync.props;
    let {selectedRowIndex, selectedColumnIndex} = this.scrollSync.state;
    let {key, style, rowIndex, columnIndex} = gridCellProps;

    let cellData: C = this.state.headerCells.get(columnIndex);

    return this.renderCell(gridCellProps, cellData, measurer => {
      return (
        <span
          className={classNames(classes.headerCell, AbstractScrollSync.getClassNames({
            classes,
            rowIndex,
            columnIndex,
            handleMouseEnter: this.shouldHandleMouseEnter(),
            highlightSelectedRow: this.shouldHighlightSelectedRow(),
            highlightSelectedColumn: this.shouldHighlightSelectedColumn(),
            selectedRowIndex,
            selectedColumnIndex
          }))}
          key={key}
          style={style}>
          {this.render(gridCellProps, cellData, measurer)}
        </span>
      );
    });
  }

  public renderLeftSideCell(gridCellProps: GridCellProps): React.ReactNode {

    let {classes} = this.scrollSync.props;
    let {selectedRowIndex, selectedColumnIndex} = this.scrollSync.state;
    let {columnIndex, key, rowIndex, style} = gridCellProps;

    let cellData: R = this.state.sideCells.get(rowIndex);

    return this.renderCell(gridCellProps, cellData, measurer => {
      return (
        <span
          className={classNames(classes.leftSideCell, AbstractScrollSync.getClassNames({
            classes,
            rowIndex,
            columnIndex,
            handleMouseEnter: this.shouldHandleMouseEnter(),
            highlightSelectedRow: this.shouldHighlightSelectedRow(),
            highlightSelectedColumn: this.shouldHighlightSelectedColumn(),
            selectedRowIndex,
            selectedColumnIndex
          }))}
          key={key}
          style={style}>
          {this.render(gridCellProps, cellData, measurer)}
        </span>
      );
    });
  }

  public renderBodyCell(gridCellProps: GridCellProps): React.ReactNode {

    let {classes} = this.scrollSync.props;
    let {selectedRowIndex, selectedColumnIndex} = this.scrollSync.state;
    let {columnIndex, key, rowIndex, style} = gridCellProps;

    let cellData: G = this.state.gridCells.get(rowIndex)?.get(columnIndex);

    return this.renderCell(gridCellProps, cellData, measurer => {
      return (
        <span
          className={classNames(classes.bodyCell, AbstractScrollSync.getClassNames({
            classes,
            rowIndex,
            columnIndex,
            handleMouseEnter: this.shouldHandleMouseEnter(),
            highlightSelectedRow: this.shouldHighlightSelectedRow(),
            highlightSelectedColumn: this.shouldHighlightSelectedColumn(),
            selectedRowIndex,
            selectedColumnIndex
          }))}
          key={key}
          style={style}
          onMouseEnter={this.shouldHandleMouseEnter() ? this.onMouseEnter(rowIndex, columnIndex) : null}>
          {this.render(gridCellProps, cellData, measurer)}
        </span>
      );
    });
  }

  public onSectionRendered(init: boolean): void {
    this.checkForMissingCellsDebounced(init);
  }
}