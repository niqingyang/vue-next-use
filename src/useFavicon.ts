import {Ref, unref} from "vue";
import {sources, useEffect} from './index';

const useFavicon = (href: string | Ref<string>) => {
    useEffect(() => {
        const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = unref(href);
        document.getElementsByTagName('head')[0].appendChild(link);
    }, sources([href]));
};

export default useFavicon;
