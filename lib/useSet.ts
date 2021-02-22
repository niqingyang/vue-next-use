import {Ref} from "vue";
import {useState} from "./index";

export interface StableActions<K> {
    add: (key: K) => void;
    remove: (key: K) => void;
    toggle: (key: K) => void;
    reset: () => void;
}

export interface Actions<K> extends StableActions<K> {
    has: (key: K) => boolean;
}

const useSet = <K>(initialSet = new Set<K>()): [Ref<Set<K>>, Actions<K>] => {
    const [set, setSet] = useState(initialSet);

    const stableActions = (): StableActions<K> => {
        const add = (item: K) => setSet((prevSet) => new Set([...Array.from(prevSet), item]));
        const remove = (item: K) =>
            setSet((prevSet) => new Set(Array.from(prevSet).filter((i) => i !== item)));
        const toggle = (item: K) =>
            setSet((prevSet) =>
                prevSet.has(item)
                    ? new Set(Array.from(prevSet).filter((i) => i !== item))
                    : new Set([...Array.from(prevSet), item])
            );

        return {add, remove, toggle, reset: () => setSet(initialSet)};
    };

    const utils = {
        has: (item) => set.value.has(item),
        ...stableActions(),
    } as Actions<K>;

    return [set, utils];
};

export default useSet;