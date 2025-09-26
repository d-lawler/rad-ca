export default defineNuxtPlugin(() => {
    // This plugin ensures SEO composable is available and sets up default meta tags

    // Set default meta tags that apply to all pages
    useHead({
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
            { name: 'format-detection', content: 'telephone=no' },
            { name: 'msapplication-tap-highlight', content: 'no' },
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ]
    })

    // Log SEO setup in development
    if (process.dev) {
        console.log('🎯 SEO Plugin loaded - Default meta tags applied')
    }
})