import {onMounted} from "vue";

export default function useMount(fn: () => void) {
    onMounted(() => {
        fn();
    })
}