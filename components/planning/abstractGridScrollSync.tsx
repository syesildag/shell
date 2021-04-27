/**
 * @author SYESILDAG
 *
 */
import * as React from 'react';
import { GridCellProps } from 'react-virtualized';

import AbstractScrollSync, { AbstractScrollSyncProps, AbstractScrollSyncState } from './abstractScrollSync';


export type Key = string | number | symbol;

export interface GridReactNodeProvider {

   updateCellData(gridCellProps: GridCellProps, key: Key, value: any, clearCache: boolean): any;

   renderBodyCell(props: GridCellProps): React.ReactNode;

   renderHeaderCell(props: GridCellProps): React.ReactNode;

   renderLeftHeaderCell(props: GridCellProps): React.ReactNode;

   renderLeftSideCell(props: GridCellProps): React.ReactNode;

   onSectionRendered(init: boolean): void;
}

// noinspection JSUnusedGlobalSymbols
export default abstract class AbstractGridScrollSync<P extends AbstractScrollSyncProps = AbstractScrollSyncProps, S extends AbstractScrollSyncState = AbstractScrollSyncState>
   extends AbstractScrollSync<P, S> {

   protected gridReactNodeProvider: GridReactNodeProvider;

   protected constructor(props: P, context?: any) {
      super(props, context);
      this.gridReactNodeProvider = this.getGridReactNodeProvider();
   }

   protected abstract getGridReactNodeProvider(): GridReactNodeProvider;

   public updateCellData(gridCellProps: GridCellProps, key: Key, value: any, clearCache: boolean) {
      return this.gridReactNodeProvider.updateCellData(gridCellProps, key, value, clearCache);
   }

   // noinspection JSUnusedGlobalSymbols
   protected renderBodyCell(gridCellProps: GridCellProps) {
      return this.gridReactNodeProvider.renderBodyCell(gridCellProps);
   }

   // noinspection JSUnusedGlobalSymbols
   protected renderHeaderCell(gridCellProps: GridCellProps) {
      return this.gridReactNodeProvider.renderHeaderCell(gridCellProps);
   }

   // noinspection JSUnusedGlobalSymbols
   protected renderLeftHeaderCell(gridCellProps: GridCellProps) {
      return this.gridReactNodeProvider.renderLeftHeaderCell(gridCellProps);
   }

   // noinspection JSUnusedGlobalSymbols
   protected renderLeftSideCell(gridCellProps: GridCellProps) {
      return this.gridReactNodeProvider.renderLeftSideCell(gridCellProps);
   }

   protected onSectionRendered(init: boolean) {
      this.gridReactNodeProvider.onSectionRendered(init);
   }
}