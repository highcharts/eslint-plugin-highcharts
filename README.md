eslint-plugin-highcharts
========================

ESLint rules for the Highcharts project



Adding new rules
----------------

Navigate to this folder and run `yo eslint:rule`.



Installation
------------

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-highcharts`:

```
$ npm install eslint-plugin-highcharts --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-highcharts` globally.



Usage
-----

Add `highcharts` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "highcharts"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "highcharts/rule-name": 2
    }
}
```






