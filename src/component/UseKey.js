import useKey from "../useKey";

export default {
    template: '<Fragment></Fragment>',
    props: {
        filter: {
            type: [String, Function],
            required: true
        },
        fn: {
            type: Function
        },
        event: {
            type: String,
        },
        target: {
            Object
        },
        options: {
            Object
        },
    },
    setup(props) {
        const {filter, fn, ...rest} = props;
        useKey(filter, fn, rest);
        return {};
    }
}