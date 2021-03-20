import {onMounted} from "vue";

export default function useMounted(fn: () => void) {
    onMounted(() => {
        fn();
    })
}