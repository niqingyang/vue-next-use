import UseHoverDirty from './UseHoverDirty.vue';
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/UseHoverDirty',
    component: UseHoverDirty,
    argTypes: {
        enabled: {default: true}
    }
};

export const Docs = ShowDocs({md: require('../docs/useHoverDirty.md')});

export const Demo = ShowDemo(UseHoverDirty, {
    enabled: true
});



