import {reactive, ref} from "vue";
import {ShowDemo, ShowDocs} from './util/index';
import {useHoverDirty} from "../src/index";

export default {
    title: 'Sensors/useHoverDirty',
    argTypes: {
        enabled: {default: true}
    }
};

export const Docs = ShowDocs(require('../docs/useHoverDirty.md'));

export const Demo = ShowDemo({
    template: '<span ref="faceNode" style="font-size: 32px; cursor: pointer;">{{isHovering ? \'😀\' : \'🙁\'}}</span>',
    props: {
        enabled: {
            type: Boolean,
            required: true
        }
    },
    setup(props) {
        const {enabled} = props;
        const faceNode = ref(null);
        const isHovering = useHoverDirty(faceNode, enabled);
        return {
            faceNode,
            isHovering
        };
    },
}, {
    enabled: true
});



