import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        // Increase the warning threshold to avoid false positives
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                // Split vendor libraries into named chunks for long-term browser caching
                manualChunks(id) {
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/lucide-react')) {
                        return 'vendor-lucide';
                    }
                },
            },
        },
        // Enable modern CSS minification
        cssMinify: true,
        // Target modern browsers for smaller output (no legacy polyfills)
        target: 'esnext',
    },
});
