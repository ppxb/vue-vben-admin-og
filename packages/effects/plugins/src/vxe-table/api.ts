import type { VxeGridInstance } from 'vxe-table';

import type { ExtendedFormApi } from '@vben-core/form-ui';

import type { VxeGridProps } from './types';

import { toRaw } from 'vue';

import { Store } from '@vben-core/shared/store';
import {
  bindMethods,
  isBoolean,
  isFunction,
  StateHandler,
} from '@vben-core/shared/utils';

// 浅合并函数，只处理两层，避免深度递归
function mergeState<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      // 只对对象类型进行一层合并
      if (
        sourceValue !== null &&
        sourceValue !== undefined &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        targetValue !== undefined &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = { ...targetValue, ...sourceValue } as any;
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as any;
      }
    }
  }

  return result;
}

function getDefaultState<T extends Record<string, any>>(): VxeGridProps<T> {
  return {
    class: '',
    gridClass: '',
    gridOptions: {},
    gridEvents: {},
    formOptions: undefined,
    showSearchForm: true,
  };
}

export class VxeGridApi<T extends Record<string, any> = Record<string, any>> {
  public formApi!: ExtendedFormApi;
  public grid!: VxeGridInstance<T>;
  public state: VxeGridProps<T>;
  public store: Store<VxeGridProps<T>>;

  private isMounted = false;
  private stateHandler: StateHandler;

  constructor(options: VxeGridProps<T> = {}) {
    const defaultState = getDefaultState<T>();
    const initialState = mergeState(defaultState, options);

    this.store = new Store<VxeGridProps<T>>(initialState, {
      onUpdate: () => {
        this.state = this.store.state;
      },
    });

    this.state = this.store.state;
    this.stateHandler = new StateHandler();
    bindMethods(this);
  }

  mount(instance: null | VxeGridInstance<T>, formApi: ExtendedFormApi): void {
    if (!this.isMounted && instance) {
      this.grid = instance;
      this.formApi = formApi;
      this.stateHandler.setConditionTrue();
      this.isMounted = true;
    }
  }

  async query(params: Record<string, any> = {}): Promise<void> {
    try {
      await this.grid.commitProxy('query', toRaw(params));
    } catch (error) {
      console.error('Error occurred while querying:', error);
    }
  }

  async reload(params: Record<string, any> = {}): Promise<void> {
    try {
      await this.grid.commitProxy('reload', toRaw(params));
    } catch (error) {
      console.error('Error occurred while reloading:', error);
    }
  }

  setGridOptions(options: Partial<VxeGridProps<T>['gridOptions']>): void {
    this.setState({
      gridOptions: options,
    });
  }

  setLoading(isLoading: boolean): void {
    this.setState({
      gridOptions: {
        loading: isLoading,
      },
    });
  }

  setState(
    stateOrFn:
      | ((prev: VxeGridProps<T>) => Partial<VxeGridProps<T>>)
      | Partial<VxeGridProps<T>>,
  ): void {
    if (isFunction(stateOrFn)) {
      this.store.setState((prev) => {
        const partial = stateOrFn(prev);
        return mergeState(prev, partial);
      });
    } else {
      this.store.setState((prev) => mergeState(prev, stateOrFn));
    }
  }

  toggleSearchForm(show?: boolean): boolean | undefined {
    const newValue = isBoolean(show) ? show : !this.state.showSearchForm;
    this.setState({
      showSearchForm: newValue,
    });
    return this.state.showSearchForm;
  }

  unmount(): void {
    this.isMounted = false;
    this.stateHandler.reset();
  }
}
