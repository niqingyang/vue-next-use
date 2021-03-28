import {useDefault, useState} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useDefault',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useDefault.md'));

export const Demo = ShowDemo({
    setup() {

        const initialUser = {name: 'Marshall'}
        const defaultUser = {name: 'Mathers'}
        const [user, setUser] = useDefault(defaultUser, initialUser);

        return () => (
            <div>
                <div>User: {user.value.name}</div>
                <input type="text" onInput={e => setUser({name: e.target.value})}/>
                <button onClick={() => setUser(null)}>set to null</button>
            </div>
        );
    }
});

