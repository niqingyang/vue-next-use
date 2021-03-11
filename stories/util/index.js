import {h} from 'vue';
import Docs from './Docs.vue';

// 展示文档
export function ShowDocs(args) {

    const docs = (args) => ({
        components: {
            Docs
        },
        setup() {

            const {md} = args;

            return {
                content: md?.default ? md.default : md
            }
        },
        template: '<Docs :content="content"></Docs>'
    });

    return docs.bind({}, args);
}

// 展示单个组件
export function ShowDemo(vnode, args) {
    const Template = (args) => ({
        components: {
            Demo: vnode
        },
        setup() {
            return {args};
        },
        template: '<Demo v-bind="args"></Demo>'
    });
    const Demo = Template.bind({});
    Demo.args = args;
    return Demo;
}