import {computed, ComputedRef, isRef, Ref, unref} from 'vue';
import screenfull from 'screenfull';
import {noop, off, on} from './misc/util';
import {useState, useEffect} from "./index";

export interface FullScreenOptions {
    video?: Ref<HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitExitFullscreen?: () => void }>;
    onClose?: (error?: Error) => void;
}

const useFullscreen = (
    ref: Ref<Element>,
    enabled: Ref<boolean>,
    options: FullScreenOptions = {}
): ComputedRef<boolean> => {
    const {video, onClose = noop} = options;
    const [isFullscreen, setIsFullscreen] = useState(unref(enabled));

    useEffect(() => {
        if (!unref(enabled)) {
            return;
        }
        if (!ref.value) {
            return;
        }

        const onWebkitEndFullscreen = () => {
            if (video?.value) {
                off(video.value, 'webkitendfullscreen', onWebkitEndFullscreen);
            }
            onClose();
        };

        const onChange = () => {
            if (screenfull.isEnabled) {
                const isScreenfullFullscreen = screenfull.isFullscreen;
                setIsFullscreen(isScreenfullFullscreen);
                if (!isScreenfullFullscreen) {
                    onClose();
                }
            }
        };

        if (screenfull.isEnabled) {
            try {
                screenfull.request(ref.value);
                setIsFullscreen(true);
            } catch (error) {
                onClose(error);
                setIsFullscreen(false);
            }
            screenfull.on('change', onChange);
        } else if (video && video.value && video.value.webkitEnterFullscreen) {
            video.value.webkitEnterFullscreen();
            on(video.value, 'webkitendfullscreen', onWebkitEndFullscreen);
            setIsFullscreen(true);
        } else {
            onClose();
            setIsFullscreen(false);
        }

        return () => {
            setIsFullscreen(false);
            if (screenfull.isEnabled) {
                try {
                    screenfull.off('change', onChange);
                    screenfull.exit();
                } catch {
                }
            } else if (video && video.value && video.value.webkitExitFullscreen) {
                off(video.value, 'webkitendfullscreen', onWebkitEndFullscreen);
                video.value.webkitExitFullscreen();
            }
        };
    }, enabled);

    return computed(() => {
        return isFullscreen.value
    });
};

export default useFullscreen;