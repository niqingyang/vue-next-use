import {useCss} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';
import {h, createVNode} from "vue";

export default {
    title: 'UI/useCss',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useCss.md'));

export const Demo = ShowDemo({
    setup(props) {

        const className = useCss({
            color: 'red',
            border: '1px solid red',
            '&:hover': {
                color: 'blue',
            }
        });

        return () => (
            <div class={className}>
                Hover me!
            </div>
        );
    }
});