import {create, NanoRenderer} from 'nano-css';
import {addon as addonCSSOM, CSSOMAddon} from 'nano-css/addon/cssom';
import {addon as addonVCSSOM, VCSSOMAddon} from 'nano-css/addon/vcssom';
import {cssToTree} from 'nano-css/addon/vcssom/cssToTree';
import {sources, useEffect} from "./index";
import {isRef, Ref, unref} from "vue";

type Nano = NanoRenderer & CSSOMAddon & VCSSOMAddon;
const nano = create() as Nano;
addonCSSOM(nano);
addonVCSSOM(nano);

let counter = 0;

export default function useCss(css: object | Ref<object>): string {
    const className = 'vue-next-use-css-' + (counter++).toString(36);
    const sheet = new nano.VSheet();

    useEffect(() => {
        const tree = {};
        cssToTree(tree, unref(css), '.' + className, '');
        sheet.diff(tree);

        return () => {
            sheet.diff({});
        };
    }, isRef(css) ? css : null);

    return className;
};
