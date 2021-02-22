import {ref, onMounted, onUnmounted} from 'vue';

export default function useMountedState(): () => boolean {
    const mountedRef = ref<boolean>(false);
    const get = () => mountedRef.value;

    onMounted(() => {
        mountedRef.value = true;
    });

    onUnmounted(() => {
        mountedRef.value = false;
    });

    return get;
}
