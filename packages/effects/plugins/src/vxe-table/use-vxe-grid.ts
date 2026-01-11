import type { VxeGridSlots, VxeGridSlotTypes } from 'vxe-table';

import type { Component, Ref, SlotsType } from 'vue';

import type { BaseFormComponentType } from '@vben-core/form-ui';

import type { ExtendedVxeGridApi, VxeGridProps } from './types';

import { defineComponent, h, onBeforeUnmount } from 'vue';

import { useStore } from '@vben-core/shared/store';

import { VxeGridApi } from './api';
import VxeGrid from './use-vxe-grid.vue';

type VxeGridSlotsWithoutForm<T extends Record<string, any>> = Omit<
  VxeGridSlots<T>,
  'form'
>;

type GridComponentSlots<T extends Record<string, any>> =
  VxeGridSlotsWithoutForm<T> & {
    'table-title': undefined;
    'toolbar-actions': VxeGridSlotTypes.DefaultSlotParams<T>;
    'toolbar-tools': VxeGridSlotTypes.DefaultSlotParams<T>;
  };

type VbenVxeGridComponent = Component<any, any, any, any, any, any>;

// 扩展 API 实现类
class ExtendedApiImpl<
  T extends Record<string, any>,
  D extends BaseFormComponentType,
>
  extends VxeGridApi<T>
  implements ExtendedVxeGridApi<T, D>
{
  useStore(): Readonly<Ref<VxeGridProps<T, D>>>;
  useStore<R>(selector: (state: VxeGridProps<T, D>) => R): Readonly<Ref<R>>;
  useStore<R>(selector?: (state: VxeGridProps<T, D>) => R): Readonly<Ref<any>> {
    return useStore(this.store, selector as any);
  }
}

export function useVbenVxeGrid<
  T extends Record<string, any> = Record<string, any>,
  D extends BaseFormComponentType = BaseFormComponentType,
>(
  options: VxeGridProps<T, D>,
): readonly [VbenVxeGridComponent, ExtendedVxeGridApi<T, D>] {
  // 创建扩展 API 实例
  const baseApi = new VxeGridApi<T>(options);
  const api = Object.setPrototypeOf(
    baseApi,
    ExtendedApiImpl.prototype,
  ) as ExtendedApiImpl<T, D>;

  const Grid = defineComponent({
    name: 'VbenVxeGrid',
    inheritAttrs: false,
    slots: Object as SlotsType<GridComponentSlots<T>>,

    setup(_props: VxeGridProps<T, D>, { attrs, slots }) {
      onBeforeUnmount(() => {
        baseApi.unmount();
      });

      // 合并配置
      const mergedConfig = { ..._props, ...attrs } as VxeGridProps<T, D>;
      baseApi.setState(mergedConfig);

      return () => {
        // 这里的 as any 只是绕过 Vue 的 h 函数类型检查
        // 实际的类型安全由我们的类型系统保证
        // VxeGrid 组件会接收正确类型的 props
        return h(VxeGrid as any, { ...mergedConfig, api }, slots);
      };
    },
  });

  return [Grid, api] as const;
}

export type UseVbenVxeGrid = typeof useVbenVxeGrid;
