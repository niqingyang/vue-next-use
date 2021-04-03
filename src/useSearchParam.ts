import {Ref, unref} from "vue";
import {useEffect, useState} from './index';
import {isBrowser, off, on} from './misc/util';

const getValue = (search: string, param: string) => new URLSearchParams(search).get(param);

export type UseQueryParam = (param: string | Ref<string>) => Ref<string | null>;

const useSearchParam: UseQueryParam = (param) => {
    const location = window.location;
    const [value, setValue] = useState<string | null>(() => getValue(location.search, unref(param)));

    useEffect(() => {
        const onChange = () => {
            setValue(getValue(location.search, unref(param)));
        };

        on(window, 'popstate', onChange);
        on(window, 'pushstate', onChange);
        on(window, 'replacestate', onChange);

        return () => {
            off(window, 'popstate', onChange);
            off(window, 'pushstate', onChange);
            off(window, 'replacestate', onChange);
        };
    }, []);

    return value;
};

const useSearchParamServer = () => null;

export default isBrowser ? useSearchParam : useSearchParamServer;
