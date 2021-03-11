import { h } from 'vue';
import UseAsyncFn from './UseAsyncFn.vue';
import { ShowDemo, ShowDocs } from './util/index';

export default {
    title: 'SideEffects/useAsyncFn',
    component: UseAsyncFn,
    argTypes: {},
};

export const Docs = ShowDocs({ md: require('../docs/useAsyncFn.md') });

export const Demo = ShowDemo(UseAsyncFn);




