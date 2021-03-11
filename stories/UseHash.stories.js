import UseHash from './UseHash.vue';
import { ShowDemo, ShowDocs } from './util/index';

export default {
    title: 'Sensors/UseHash',
    component: UseHash,
    argTypes: {},
};

export const Docs = ShowDocs({ md: require('../docs/useHash.md') });

export const Demo = ShowDemo(UseHash);




