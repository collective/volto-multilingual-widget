# volto-multilingual-widget

A widget for [Volto](https://github.com/plone/volto) to insert values for any language enabled

To be used with mrs-developer, see [Volto docs](https://docs.voltocms.com/customizing/add-ons/) for further usage informations.

## Usage

> If you're using Volto < 12, then use [v1.0.1](https://github.com/collective/volto-multilingual-widget/tree/v1.0.1)
>
> If you're using Volto < 16, then use [v2.2.4](https://github.com/collective/volto-multilingual-widget/tree/v2.2.4)

This is meant to be used on JSON or text fields, because it will send to the registry a string with a JSON inside.

In your Volto project, in `src/config.js` you can bind this widget for an id, example:

```js
import { MultilingualWidget } from 'volto-multilingual-widget'

...

export const widgets = {
  ...defaultWidgets,
  id: {
    ...defaultWidgets.id,
    cookie_consent_configuration: MultilingualWidget(),
  },
}
```

### Custom widget

If you see, you're not using the component directly, but you call as a function.
The default widget used for the form is a rich text editor, which saves strings with html.
As a parameter, you can pass a custom widget for language specific values, like:

```jsx
import { MultilingualWidget } from 'volto-multilingual-widget'
import { ArrayWidget } from '@plone/volto/components';

...

const CustomWidget = ({ id, value, placeholder, onChange }) => (
  <input type="number" id={id} placeholder={placeholder} value={value} onChange={onChange} />
)
const defaultValue = []; // could be any, defaults to ''

export const widgets = {
  ...defaultWidgets,
  id: {
    ...defaultWidgets.id,
    news_type: MultilingualWidget(ArrayWidget, defaultValue),
    cookie_consent_configuration: MultilingualWidget(CustomWidget),
  },
}
```

If needed, you can pass a second argument for the default value for the custom widget.

Multilingual widget is agnostic about value types and handles the multilingual aspect more than data specific ones.
So you could handle boolean or numeric values, which will be saved in a JSON as described below.

The only contrain about custom widget is based on the props, which are:

**id** _(string)_
ID attribute of the widget element, bound to the label for accessibility reasons.

**value** _(any)_
Language specific value.

**placeholder** _(string)_
Placeholder text of the input

**onChange** _(function)_
This is the method that will apply updates to the final JSON.
Its firm is:

`langValue => void`

and you should pass directly the language specific value, so the type of the parameter should be the same as `value` one.

## Results

What will be sent to Plone is in this format, with a key for any enabled language in your Plone site:

```json
{
  "it": "<p>Il tuo testo in italiano</p>",
  "en": "<p>Your text in English</p>",
  "eo": "<p>Via esperanta teksto</p>"
}
```
