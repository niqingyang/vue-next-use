import UseHover from './UseHover.vue';
import { ShowDemo, ShowDocs } from './util/index';

export default {
    title: 'Sensors/UseHover',
    component: UseHover,
    argTypes: {},
};

export const Docs = ShowDocs({ md: require('../docs/useHover.md') });

export const Demo = ShowDemo(UseHover);




