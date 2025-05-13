import { transform } from '@babel/core';
// eslint-disable-next-line import/extensions
import * as MinorPrompt from './dist/minorPrompt.js';

export default {
    "require": {
        '@tobrien/minorprompt': MinorPrompt
    },
    transformCode: (code) => {
        // transform the code using @bable/preset-typescript
        const transformedCode = transform(code, {
            filename: 'test.ts',
            presets: ['@babel/preset-typescript'],
            plugins: [
                '@babel/plugin-transform-typescript',
                '@babel/plugin-transform-modules-commonjs'
            ],
            comments: true // Preserve comments
        })?.code;

        return transformedCode;
    }
}