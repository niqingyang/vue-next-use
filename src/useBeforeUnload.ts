import {watch, onUpdated, onMounted, onBeforeUnmount} from 'vue';
import {off, on} from './misc/util';

const useBeforeUnload = (enabled: boolean | (() => boolean) = true, message?: string) => {
    const handler = (event: BeforeUnloadEvent) => {
        const finalEnabled = typeof enabled === 'function' ? enabled() : true;

        if (!finalEnabled) {
            return;
        }

        event.preventDefault();

        if (message) {
            event.returnValue = message;
        }

        return message;
    }

    onMounted(() => {
        watch([enabled], ([value], oldValue) => {
            if (value) {
                on(window, 'beforeunload', handler);
            } else {
                off(window, 'beforeunload', handler);
            }
        }, {
            immediate: true
        });
    });

    onBeforeUnmount(() => {
        off(window, 'beforeunload', handler);
    });
};

export default useBeforeUnload;