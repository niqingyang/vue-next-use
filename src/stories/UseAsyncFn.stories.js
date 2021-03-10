import UseAsyncFn from './UseAsyncFn.vue';

export default {
    title: 'Example/useAsyncFn',
    component: UseAsyncFn,
    argTypes: {},
};

const Template = (args) => ({
    // Components used in your story `template` are defined in the `components` object
    components: {UseAsyncFn},
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
        return {
            args
        };
    },
    // And then the `args` are bound to your component with `v-bind="args"`
    template: '<use-async-fn v-bind="args" />',
});

export const Demo = Template.bind({});
Demo.args = {
    primary: true,
    label: 'Button',
};