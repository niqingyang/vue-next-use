import {renderSlot, h} from 'vue';

const NewTabStory = h({
    name: 'NewTabStory',
    setup(props, {slots}) {

        if (window.location === window.parent.location) {
            return () => (
                renderSlot(slots, 'default')
            );
        }

        return () => (
            <p>
                This story should be{' '}
                <a href={window.location.href} target="_blank" title="Open in new tab">
                    opened in a new tab
                </a>
                .
            </p>
        );
    }
});

export default NewTabStory;
