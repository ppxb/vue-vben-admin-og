import type {
  VxeGridListeners,
  VxeGridPropTypes,
  VxeGridProps as VxeTableGridProps,
  VxeUIExport,
} from 'vxe-table';

import type { Ref } from 'vue';

import type { ClassType } from '@vben/types';

import type { BaseFormComponentType, VbenFormProps } from '@vben-core/form-ui';

import { useVbenForm } from '@vben-core/form-ui';

import { VxeGridApi } from './api';

export interface VxePaginationInfo {
  currentPage: number;
  pageSize: number;
  total: number;
}

interface ToolbarConfigOptions extends VxeGridPropTypes.ToolbarConfig {
  search?: boolean;
}

// 限制递归深度为 1 的 Partial 类型
export type ShallowPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends any[]
      ? T[P]
      : Partial<T[P]>
    : T[P];
};

export interface VxeTableGridOptions<T = any> extends ShallowPartial<
  VxeTableGridProps<T>
> {
  toolbarConfig?: ToolbarConfigOptions;
}

export interface SeparatorOptions {
  show?: boolean;
  backgroundColor?: string;
}

// 将泛型参数设为协变位置，避免类型不兼容
export interface VxeGridProps<
  T extends Record<string, any> = Record<string, any>,
  D extends BaseFormComponentType = BaseFormComponentType,
> {
  tableTitle?: string;
  tableTitleHelp?: string;
  class?: ClassType;
  gridClass?: ClassType;
  gridOptions?: VxeTableGridOptions<T>;
  gridEvents?: VxeGridListeners<T>;
  formOptions?: VbenFormProps<D>;
  showSearchForm?: boolean;
  separator?: boolean | SeparatorOptions;
}

// 关键修改：将 ExtendedVxeGridApi 改为类而不是接口
// 这样可以避免结构类型检查导致的不兼容问题
export abstract class ExtendedVxeGridApiBase<
  D extends Record<string, any> = Record<string, any>,
  F extends BaseFormComponentType = BaseFormComponentType,
> extends VxeGridApi<D> {
  abstract useStore(): Readonly<Ref<VxeGridProps<D, F>>>;
  abstract useStore<R>(
    selector: (state: VxeGridProps<D, F>) => R,
  ): Readonly<Ref<R>>;
}

// 导出类型别名
export type ExtendedVxeGridApi<
  D extends Record<string, any> = Record<string, any>,
  F extends BaseFormComponentType = BaseFormComponentType,
> = ExtendedVxeGridApiBase<D, F>;

export interface SetupVxeTable {
  configVxeTable: (ui: VxeUIExport) => void;
  useVbenForm: typeof useVbenForm;
}
