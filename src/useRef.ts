import {Ref, ref} from "vue";

export default function useRef<T>(initialState: T): Ref<T> {
    return ref(initialState) as Ref<T>;
};