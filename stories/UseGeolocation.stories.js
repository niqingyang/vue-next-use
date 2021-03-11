import UseGeolocation from './UseGeolocation.vue';
import { ShowDemo, ShowDocs } from './util/index';

export default {
    title: 'Sensors/UseGeolocation',
    component: UseGeolocation,
    argTypes: {},
};

export const Docs = ShowDocs({ md: require('../docs/useGeolocation.md') });

export const Demo = ShowDemo(UseGeolocation);




