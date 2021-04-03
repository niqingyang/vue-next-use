import {Ref, unref} from "vue";
import {useEffect, useState, useMemo, sources} from './index';
import {off, on} from './misc/util';

type Breakpoints = {
    [name: string]: number
}

export default function useBreakpoint(
    breakpoints: Breakpoints | Ref<Breakpoints> = {laptopL: 1440, laptop: 1024, tablet: 768}
) {
    const [screen, setScreen] = useState(0);

    useEffect(() => {
        const setSideScreen = (): void => {
            setScreen(window.innerWidth);
        };
        setSideScreen();
        on(window, 'resize', setSideScreen);
        return () => {
            off(window, 'resize', setSideScreen);
        };
    });

    const sortedBreakpoints = useMemo(() => {
        return Object.entries(unref(breakpoints)).sort((a, b) => (a[1] >= b[1] ? 1 : -1));
    }, sources([breakpoints]));

    const result = useMemo(() => {
        return sortedBreakpoints.value.reduce((acc, [name, width]) => {
            if (screen.value >= width) {
                return name;
            } else {
                return acc;
            }
        }, sortedBreakpoints.value[0][0]);
    }, screen);

    return result;
};

