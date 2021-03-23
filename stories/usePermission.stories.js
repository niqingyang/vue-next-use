import {computed} from "vue";
import {usePermission} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/usePermission',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/usePermission.md'));

export const Demo = ShowDemo({
    setup() {

        // https://w3c.github.io/permissions
        const names = [
            'microphone',
            'camera',
            'midi',
            'geolocation',
            'clipboard-read',
            'clipboard-write',
        ];

        const states = [];

        names.forEach((name) => {
            states.push({
                name,
                permission: usePermission({name, userVisibleOnly: false})
            })
        });

        const permissions = computed(() => {
            const result = {};

            states.forEach((state) => {
                result[state.name] = state.permission.value
            });

            return result;
        });

        return () => {
            return (
                <pre>
                  {JSON.stringify(permissions.value, null, 2)}
                </pre>
            )
        };
    }
});

