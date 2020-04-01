# volto-multilingual-widget

A widget for [Volto](https://github.com/plone/volto) to insert values for any language enabled

To be used with mrs-developer, see [Volto docs](https://docs.voltocms.com/customizing/add-ons/) for further usage informations.

## Install mrs-developer and configure your Volto project

In your Volto project:

```bash
yarn add mrs-developer collective/volto-multilingual-widget
```

and in `package.json`:

```json
  "scripts": {
    "develop:npx": "npx -p mrs-developer missdev --config=jsconfig.json --output=addons",
    "develop": "missdev --config=jsconfig.json --output=addons",
    "preinstall": "if [ -f $(pwd)/node_modules/.bin/missdev ]; then yarn develop; else yarn develop:npx; fi",
    "postinstall": "rm -rf ./node_modules/volto-* && yarn omelette",
    ...
  }
```

Create a `mrs.developer.json` file:

```json
{
  "volto-multilingual-widget": {
    "url": "git@github.com:collective/volto-multilingual-widget.git"
  }
}
```

In `jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "volto-multilingual-widget": ["addons/volto-multilingual-widget"]
    },
    "baseUrl": "src"
  }
}
```

Fix tests, in `package.json`:

```json
"jest": {
    ...
    "moduleNameMapper": {
      "@plone/volto/(.*)$": "<rootDir>/node_modules/@plone/volto/src/$1",
      "@package/(.*)$": "<rootDir>/src/$1",
      "volto-multilingual-widget/(.*)$": "<rootDir>/src/addons/volto-multilingual-widget/src/$1",
      "~/(.*)$": "<rootDir>/src/$1"
    },
    "testMatch": [
      "**/__tests__/**/*.[jt]s?(x)",
      "**/?(*.)+(spec|test).[jt]s?(x)",
      "!**/src/addons/volto/**/*"
    ],
    ...
```

Edit `.eslintrc`:

```json
{
  "extends": "./node_modules/@plone/volto/.eslintrc",
  "settings": {
    "import/resolver": {
      "alias": {
        "map": [
          ["@plone/volto", "@plone/volto/src"],
          ["@package", "./src"],
          ["volto-multilingual-widget", "./src/addons/volto-multilingual-widget/src"]
        ],
        "extensions": [".js", ".jsx", ".json"]
      },
      "babel-plugin-root-import": {
        "rootPathSuffix": "src"
      }
    }
  }
}
```

Add `src/addons` in `.gitignore`:

```
# .gitignore
src/addons
```

Then, run `mrs-developer` and install dependencies:

```bash
yarn develop
yarn
```

## Usage

This is meant to be used on JSON or text fields, because it will send to the registry a string with a JSON inside.

In your Volto project, in `src/config.js` you can bind this widget for an id, example:

```js
import MultilingualWidget from 'volto-multilingual-widget'

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
As a parameter, you can pass a custom widget for language specific values, like:

```jsx
import MultilingualWidget from 'volto-multilingual-widget'

const CustomWidget = ({ id, value, onChange }) => (
  <input type="number" id={id} value={value} onChange={onChange} />
)

export const widgets = {
  ...defaultWidgets,
  id: {
    ...defaultWidgets.id,
    cookie_consent_configuration: MultilingualWidget(CustomWidget),
  },
}
```

## Results

What will be sent to Plone is in this format, with a key for any enabled language in your Plone site:

```json
{
  "it": "Il tuo testo in italiano",
  "en": "Your text in English",
  "eo": "Via esperanta teksto"
}
```