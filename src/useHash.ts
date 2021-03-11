import {Ref, unref, watch} from "vue";
import {useEffect, useState} from './index';
import {off, on} from './misc/util';
import {SetStateAction} from "./misc/types";

/**
 * read and write url hash, response to url hash change
 */
export default function useHash(): [Ref<string>, (hash: string) => void] {
    const [hash, setHash] = useState(() => window.location.hash);

    const onHashChange = () => {
        setHash(window.location.hash);
    };

    useEffect(() => {
        on(window, 'hashchange', onHashChange);
        return () => {
            off(window, 'hashchange', onHashChange);
        }
    });

    watch(hash, (newHash: string) => {
        if (window.location.hash != newHash) {
            window.location.hash = newHash;
        }
    });

    const _setHash = (newHash: string) => {
        if (newHash !== unref(hash)) {
            window.location.hash = newHash;
        }
    };

    return [hash, _setHash];
};