import {onMounted, onUpdated, Teleport, watch, defineComponent, renderSlot, onBeforeUnmount, VNode, Ref} from 'vue';
import {useRef, useMountedState, useEffect, useState} from "./index";

const Content = defineComponent({
    name: 'Content',
    props: {
        contentMounted: {
            type: Function,
            default: () => {
            }
        },
        contentUpdated: {
            type: Function,
            default: () => {
            }
        },
    },
    emits: [
        'onContentMounted',
        'onContentUpdated',
    ],
    setup(props, ctx) {

        onMounted(() => props.contentMounted())
        onUpdated(() => props.contentUpdated())

        return () => {
            // @ts-ignore
            const children = ctx.slots?.default();
            return (
                <>
                    {children}
                </>
            )
        };
    }
});

// 参考：https://github.com/ryanseddon/react-frame-component
export const Frame = {
    name: 'Frame',
    props: {
        mountTarget: {
            type: String
        },
        contentMounted: {
            type: Function,
            default: () => {
            }
        },
        contentUpdated: {
            type: Function,
            default: () => {
            }
        },
        initialContent: {
            type: String,
            default: '<!DOCTYPE html><html><head></head><body><div class="frame-root"></div></body></html>'
        }
    },
    IntrinsicAttributes: true,
    setup(props, ctx) {
        const [node] = useState<HTMLIFrameElement | null>(null);

        const isMounted = useMountedState();

        const getDoc = (): HTMLDocument | null => {
            return node.value ? node.value.contentDocument : null;
        }

        const getMountTarget = () => {
            const doc = getDoc();
            if (props.mountTarget) {
                return doc?.querySelector(props.mountTarget);
            }
            return doc?.body.children[0];
        }

        return () => {

            const renderFrameContents = () => {

                if (!isMounted()) {
                    return null;
                }

                const doc = getDoc();

                if (!doc) {
                    return null;
                }

                const win = doc.defaultView;

                if (doc.body.children.length < 1) {
                    doc.open('text/html', 'replace');
                    doc.write(props.initialContent);
                    doc.close();
                }

                const contentMounted = props.contentMounted;
                const contentUpdated = props.contentUpdated;

                const mountTarget = getMountTarget();

                // @ts-ignore
                return (
                    <Content contentMounted={contentMounted} contentUpdated={contentUpdated}>
                        <Teleport to={doc.head}>{renderSlot(ctx.slots, 'head')}</Teleport>
                        <Teleport to={mountTarget}>
                            <div class="frame-content">{renderSlot(ctx.slots, 'default')}</div>
                        </Teleport>
                    </Content>
                );
            }

            return (
                <iframe ref={node}>
                    {renderFrameContents()}
                </iframe>
            )
        };
    }
};

export default function useFrame() {

}