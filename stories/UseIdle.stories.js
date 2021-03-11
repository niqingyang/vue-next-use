import UseIdle from './UseIdle.vue';
import { ShowDemo, ShowDocs } from './util/index';

export default {
    title: 'Sensors/UseIdle',
    component: UseIdle,
    argTypes: {},
};

export const Docs = ShowDocs({ md: require('../docs/useIdle.md') });

export const Demo = ShowDemo(UseIdle);




