import {provide, InjectionKey} from 'vue';

export default function useProvide<T>(key: InjectionKey<T> | string | number, value: T) {
    provide(key, value);
}