import {useMeasure, useState} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useMeasure',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useMeasure.md'));

export const Demo = ShowDemo({
    setup() {
        const [ref, rect] = useMeasure();

        return () => (
            <div ref={ref} style="border: 1px solid red;">
                <div>x: {rect.x}</div>
                <div>y: {rect.y}</div>
                <div>width: {rect.width}</div>
                <div>height: {rect.height}</div>
                <div>top: {rect.top}</div>
                <div>right: {rect.right}</div>
                <div>bottom: {rect.bottom}</div>
                <div>left: {rect.left}</div>
            </div>
        );
    }
});





