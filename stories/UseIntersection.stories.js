import UseIntersection from './UseIntersection.vue';
import { ShowDemo, ShowDocs } from './util/index';

export default {
    title: 'Sensors/UseIntersection',
    component: UseIntersection,
    argTypes: {},
};

export const Docs = ShowDocs({ md: require('../docs/useIntersection.md') });

export const Demo = ShowDemo(UseIntersection);




