# `useBeforeUnload`

Vue side-effect hook that shows browser alert when user try to reload or close the page.


## Usage

### Boolean check

```jsx
import {useBeforeUnload, useToggle} from 'vue-next-use';

const DemoBool = {
  setup(){
      const [dirty, toggleDirty] = useToggle(false);
      useBeforeUnload(dirty, 'You have unsaved changes, are you sure?');

      return () => (
          <div>
              {dirty.value && <p>Try to reload or close tab</p>}
              <button onClick={() => toggleDirty()}>{dirty.value ? 'Disable' : 'Enable'}</button>
          </div>
      );
  }
};
```

### Function check

Note: Since every `dirtyFn` change registers a new callback

```jsx
import {useBeforeUnload, useToggle} from 'vue-next-use';

const DemoFUnc = {
  setup(){
      const [dirty, toggleDirty] = useToggle(false);
      const dirtyFn = () => {
          return dirty.value;
      };
      useBeforeUnload(dirtyFn, 'You have unsaved changes, are you sure?');

      return () => (
          <div>
              {dirty.value && <p>Try to reload or close tab</p>}
              <button onClick={() => toggleDirty()}>{dirty.value ? 'Disable' : 'Enable'}</button>
          </div>
      );
  }
};
```
