# Dirty-State Handling in SmartMenu Admin UI

This document records the agreed-upon pattern for tracking **unsaved changes** ("dirty" state) across SmartMenu configuration screens. Follow these guidelines whenever you add new panels or pages.

## TL;DR
1. **Panels emit only the fields that have *actually* changed.**  
   Each toggle/input handler calls `onFieldChange({ [field]: newValue })`.
2. **Page-level screens own the `pendingChanges` object.**  
   They compare incoming changes to the *original* `widget` to add or remove keys.  
   `dirty = Object.keys(pendingChanges).length > 0`.
3. **Save button is enabled when `dirty === true`; disabled otherwise.**  
   Cancelling performs a **soft-reset**: clears `pendingChanges` and bumps a `formKey` state variable so child panels remount with pristine props. No hard page reload.

```
SmartMenuXxxPage
└── XxxPanel   (many toggle / input components)

XxxPanel (child)
└─ on user change → onFieldChange({ field: newValue })

SmartMenuXxxPage (parent)
└─ handleFieldChange(diff)  // merge diff into pendingChanges
   │
   └ dirty = pendingChanges not empty
```

## Detailed Steps
### 1. In each **Panel** component
```tsx
const handleToggle = (val: boolean) => {
  setMyState(val);
  onFieldChange({ displaySomething: val }); // emit minimal diff
};
```
* Never send the entire widget or a pre-computed diff object.
* Do *not* attempt deep comparisons in the panel; leave that to the page.

### 2. In each **Page** component (`SmartMenuMarketing`, `SmartMenuFeatures`, etc.)
```tsx
const [pending, setPending] = useState<Record<string, unknown>>({});
const [formKey, setFormKey] = useState(0);          // remount helper on cancel
const originalRef = useRef<Widget | null>(widget); // snapshot original once

// keep snapshot fresh when a *different* widget loads
useEffect(() => {
  if (widget && widget.id !== originalRef.current?.id) {
    originalRef.current = widget;
    setPending({});
  }
}, [widget]);

const handleFieldChange = (changes: Record<string, unknown>) => {
  if (!originalRef.current) return;
  setPending(prev => {
    const next = { ...prev };
    for (const [k, v] of Object.entries(changes)) {
      let original = (originalRef.current as Record<string, unknown>)[k];
      // undefined → sensible falsy default so undefined vs false/0/'' is *not* dirty
      if (original === undefined) {
        if (typeof v === 'boolean') original = false;
        else if (typeof v === 'number') original = 0;
        else if (typeof v === 'string') original = '';
      }
      if (JSON.stringify(original) === JSON.stringify(v)) {
        delete next[k];
      } else {
        next[k] = v;
      }
    }
    return next;
  });
};

const dirty = Object.keys(pending).length > 0;

const handleCancel = () => {
  setPending({});   // clear dirty state
  setFormKey(k => k + 1); // remount child panels instantly
};
```
* The JSON-stringify comparison is adequate because values are primitives or small arrays. If you store large objects, prefer a specialised deep-equal helper.

### 3. Saving
```tsx
if (!widget?.id || !dirty) return;
await updateWidgetFields(widget.id, pending as Partial<Widget>);
setPending({}); // resets dirty
```

### 4. Cancelling – Soft Reset
```tsx
const handleCancel = () => {
  setPending({});
  setFormKey(k => k + 1); // forces child panels to remount with original widget props
};
```
This is instantaneous in dev and production; it avoids a full page refresh.

## Benefits
* **Consistent UX** – Save button only lights up when something truly changed.
* **Robustness** – Avoids false-positive dirty states due to unchanged values.
* **Performance** – Minimal diffs mean less re-render churn and smaller network payloads.

## When Adding New Panels
1. Copy the handler pattern from an existing panel (e.g., `MarketingPanel`).
2. Keep panel-level state local; emit single-field diffs.
3. No panel should import React Router or update the URL—leave that to pages.

## Future Improvements
* Replace JSON-stringify with a shared `deepEqual` util.
* Move `pendingChanges` logic into a reusable hook (`useWidgetDiff`).
* Add unit tests to ensure `dirty` flag behaviour.
