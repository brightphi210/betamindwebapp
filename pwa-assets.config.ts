import {
    defineConfig,
    minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
    preset: {
        ...preset,
        // Your app is dark, so give the maskable + Apple icons a black background
        // instead of the default white.
        maskable: {
            ...preset.maskable,
            resizeOptions: { ...preset.maskable.resizeOptions, background: '#000000' },
        },
        apple: {
            ...preset.apple,
            resizeOptions: { ...preset.apple.resizeOptions, background: '#000000' },
        },
    },
    // Your single logo: square, at least 512x512 (PNG or SVG).
    images: ['public/logo.png'],
});