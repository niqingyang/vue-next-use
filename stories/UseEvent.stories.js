import UseEvent from './UseEvent.vue';
import { ShowDemo, ShowDocs } from './util/index';

export default {
    title: 'Sensors/UseEvent',
    component: UseEvent,
    argTypes: {},
};

export const Docs = ShowDocs({ md: require('../docs/useEvent.md') });

export const Demo = ShowDemo(UseEvent);




