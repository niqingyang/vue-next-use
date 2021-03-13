import {h, onMounted, defineComponent} from 'vue';
import Docs from './Docs.vue';

// 展示单个组件
export function ShowDemo(vnode, args) {
    const Demo = ((args) => (
        <vnode {...args}></vnode>
    )).bind({});
    Demo.args = args;
    return Demo;
}

// 展示文档
export function ShowDocs(content) {
    return () => (
        <Docs content={content?.default || content}></Docs>
    );
}