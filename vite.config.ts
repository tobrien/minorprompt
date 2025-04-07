import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import replace from '@rollup/plugin-replace';
import { execSync } from 'child_process';
import dts from 'vite-plugin-dts';
let gitInfo = {
    branch: '',
    commit: '',
    tags: '',
    commitDate: '',
};

try {
    gitInfo = {
        branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
        commit: execSync('git rev-parse --short HEAD').toString().trim(),
        tags: '',
        commitDate: execSync('git log -1 --format=%cd --date=iso').toString().trim(),
    };

    try {
        gitInfo.tags = execSync('git tag --points-at HEAD | paste -sd "," -').toString().trim();
    } catch {
        gitInfo.tags = '';
    }
} catch {
    // eslint-disable-next-line no-console
    console.log('Directory does not have a Git repository, skipping git info');
}


export default defineConfig({
    server: {
        port: 3000
    },
    plugins: [
        ...VitePluginNode({
            adapter: 'express',
            appPath: './src/minorPrompt.ts',
            exportName: 'viteNodeApp',
            tsCompiler: 'swc',
        }),
        replace({
            '__VERSION__': process.env.npm_package_version,
            '__GIT_BRANCH__': gitInfo.branch,
            '__GIT_COMMIT__': gitInfo.commit,
            '__GIT_TAGS__': gitInfo.tags === '' ? '' : `T:${gitInfo.tags}`,
            '__GIT_COMMIT_DATE__': gitInfo.commitDate,
            '__SYSTEM_INFO__': `${process.platform} ${process.arch} ${process.version}`,
        }),
        dts({
            entryRoot: 'src',
            outDir: 'dist',
            exclude: ['**/*.test.ts'],
            include: ['**/*.ts'],
        }),
    ],
    build: {
        target: 'esnext',
        outDir: 'dist',
        rollupOptions: {
            input: [
                'src/formatter.ts',
                'src/minorPrompt.ts',
                'src/chat.ts',
            ],
        },
        lib: {
            entry: 'src/minorPrompt.ts',
            name: 'minorPrompt',
            fileName: (format) => `minorPrompt.${format}.js`,
            formats: ['es'],
        },
    },
}); 