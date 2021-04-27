import * as React from 'react';
import { CellMeasurerCache } from 'react-virtualized/dist/es/CellMeasurer';

import AbstractGridReactNodeProvider, {
   ColumnCellData,
   GridCellData,
   RemoteCall,
   RemoteCallData,
   RemoteCallResponse,
   RowCellData,
} from './abstractGridReactNodeProvider';
import { ConcurrentExecutorOptions } from './asyncIterator';
import PlanningGridScrollSync from './planningGridScrollSync';

export type PlanningRemoteCallResponse = RemoteCallResponse<PlanningCellType, PlanningCellData, PlanningCellData, PlanningCellData>;

export type PlanningCellType =
   'input'
   | 'alo_guaranteed'
   | 'alo_allow_on_request'
   | 'alo_blocking_allotment'
   | 'alo_non_blocking_allotment'
   | 'alo_blocking_retro_date'
   | 'alo_non_blocking_retro_date'
   | 'alo_pax_min'
   | 'alo_stop_sell_retro_date'
   | 'quota'
   | 'restriction_input'
   | 'restriction_checkbox'
   | 'price'
   | 'prod_price';

// noinspection JSUnusedGlobalSymbols
export interface PlanningCellData
   extends RowCellData<PlanningCellType>, ColumnCellData<PlanningCellType>, GridCellData<PlanningCellType> {

   align?: string;
   background?: string;
   bgcolor?: string;
   bold?: boolean;
   checked?: boolean;
   checkedOriginal?: boolean;
   name?: string;
   nocell?: string;
   nowrap?: string;
   onMouseOut?: string;
   onMouseOver?: string;
   pObject?: any;
   rowspan?: number;
   numTar?: number;
   numFor?: number;
   fieldParam?: 'PU' | 'CO';
   sValue?: string;
   sValueOriginal?: string;
   style?: string;
   title?: string;
   valign?: string;
   value?: string;
   width?: string;
   isPrice?: boolean;
   onRequestEnabled?: boolean;
   hasBlockingAllotment?: boolean;
   noAlo?: boolean;
   noAloOriginal?: boolean;
   allowOnRequest?: boolean;
   allowOnRequestOriginal?: boolean;
   quotasAlert?: boolean;
   readOnly?: boolean;
   sTooltipURL?: string;
   sRoomTypeCode?: string;
   sSQLDate?: string;
   ruleId?: string;
   productId?: number;
   restrictionId?: number;
   productCode?: string;
   seasonCode?: string;
   seasonExists?: boolean;
}

export interface PlanningRemoteCallData extends RemoteCallData {
}

// noinspection JSUnusedGlobalSymbols
export default class PlanningGridReactNodeProvider
   extends AbstractGridReactNodeProvider<PlanningGridScrollSync, PlanningCellType, PlanningCellData, PlanningCellData, PlanningCellData, PlanningRemoteCallData> {

   constructor(planning: PlanningGridScrollSync) {
      super(planning);
   }

   protected shouldDebug(): boolean {
      return true;
   }

   // noinspection JSMethodCanBeStatic
   protected getOnMouseEnterDebounceTimeout(): number {
      // noinspection MagicNumberJS
      return 10;
   }

   // noinspection JSMethodCanBeStatic
   protected cacheClearAll(cache: CellMeasurerCache) {
      let firstColumnWidth = cache.getWidth(0, 1);
      let firstRowHeight = cache.getHeight(0, 1);
      super.cacheClearAll(cache);
      cache.set(0, 1, firstColumnWidth, firstRowHeight);
   }

   protected shouldHandleMouseEnter() {
      return true;
   }

   protected getRemoteCallData(): PlanningRemoteCallData {
      return this.scrollSync.props;
   }

   protected getConcurrentExecutorOptions(): ConcurrentExecutorOptions {
      return {
         availableSlots: 10
      }
   }

   protected remoteCall(
      remoteCall: RemoteCall<PlanningRemoteCallData>,
      resolve: (value?: (PlanningRemoteCallResponse | PromiseLike<PlanningRemoteCallResponse>)) => void,
      reject: (reason?: any) => void): void {

      let { token, headerIndexSet, sideIndexSet, indexGrid } = remoteCall;

      let headerCellValues: Record<number, PlanningCellData> = {};

      if (remoteCall.init)
         for (let columnIndex = 0; columnIndex < this.scrollSync.props.columnCount; columnIndex++)
            headerCellValues[columnIndex] = this.getHeaderCell(columnIndex);

      if (headerIndexSet)
         headerIndexSet.forEach(columnIndex => {
            // noinspection UnnecessaryLocalVariableJS
            headerCellValues[columnIndex] = this.getHeaderCell(columnIndex);
         });

      let sideCellValues: Record<number, PlanningCellData> = {};
      if (sideIndexSet)
         sideIndexSet.forEach(rowIndex => {
            sideCellValues[rowIndex] = { content: `C${rowIndex}` };
         });

      let gridCellValues: Record<number, Record<number, PlanningCellData>> = {};
      if (indexGrid) {
         Object.keys(indexGrid).forEach(rowIndex => {
            let columnValues: Record<number, PlanningCellData> = gridCellValues[+rowIndex];
            if (!columnValues)
               // noinspection ReuseOfLocalVariableJS, NestedAssignmentJS, AssignmentResultUsedJS
               gridCellValues[+rowIndex] = columnValues = {};

            let columnIndexes: Array<number> = indexGrid[+rowIndex];
            for (const columnIndex of columnIndexes)
               columnValues[columnIndex] = { content: `${rowIndex}-${columnIndex}` };
         });
      }

      let response: RemoteCallResponse<PlanningCellType, PlanningCellData, PlanningCellData, PlanningCellData> = {
         token,
         leftHeaderCellValue: {
            content: 'X'
         },
         headerCellValues,
         sideCellValues,
         gridCellValues
      };

      resolve(response);
   }

   private getHeaderCell(columnIndex: number) {
      return { content: `H${columnIndex}` };
   }
}