<template>
    <!-- SEO Block - renders meta tags in head -->
    <div v-if="false">
        <!-- This component doesn't render visible content -->
        <!-- All SEO data is handled via useHead -->
    </div>
</template>

<script setup>
const props = defineProps({ blok: Object })

// Set up SEO meta tags
useHead({
    title: props.blok.meta_title || undefined,
    meta: [
        // Basic meta tags
        {
            name: 'description',
            content: props.blok.meta_description || undefined
        },
        {
            name: 'keywords',
            content: props.blok.keywords || undefined
        },
        {
            name: 'author',
            content: props.blok.author || undefined
        },
        {
            name: 'robots',
            content: props.blok.robots || 'index, follow'
        },

        // Open Graph meta tags
        {
            property: 'og:title',
            content: props.blok.og_title || props.blok.meta_title || undefined
        },
        {
            property: 'og:description',
            content: props.blok.og_description || props.blok.meta_description || undefined
        },
        {
            property: 'og:image',
            content: props.blok.og_image?.filename || undefined
        },
        {
            property: 'og:image:alt',
            content: props.blok.og_image_alt || undefined
        },
        {
            property: 'og:type',
            content: props.blok.og_type || 'website'
        },
        {
            property: 'og:site_name',
            content: props.blok.og_site_name || undefined
        },

        // Twitter Card meta tags
        {
            name: 'twitter:card',
            content: props.blok.twitter_card || 'summary_large_image'
        },
        {
            name: 'twitter:title',
            content: props.blok.twitter_title || props.blok.og_title || props.blok.meta_title || undefined
        },
        {
            name: 'twitter:description',
            content: props.blok.twitter_description || props.blok.og_description || props.blok.meta_description || undefined
        },
        {
            name: 'twitter:image',
            content: props.blok.twitter_image?.filename || props.blok.og_image?.filename || undefined
        },
        {
            name: 'twitter:image:alt',
            content: props.blok.twitter_image_alt || props.blok.og_image_alt || undefined
        },
        {
            name: 'twitter:site',
            content: props.blok.twitter_site || undefined
        },
        {
            name: 'twitter:creator',
            content: props.blok.twitter_creator || undefined
        },

        // Additional SEO meta tags
        {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1'
        },
        {
            'http-equiv': 'X-UA-Compatible',
            content: 'IE=edge'
        }
    ].filter(meta => meta.content !== undefined), // Remove undefined content

    link: [
        // Canonical URL
        props.blok.canonical_url ? {
            rel: 'canonical',
            href: props.blok.canonical_url
        } : undefined,

        // Alternate languages (hreflang)
        ...(props.blok.alternate_languages || []).map(lang => ({
            rel: 'alternate',
            hreflang: lang.language_code,
            href: lang.url
        }))
    ].filter(Boolean), // Remove undefined links

    script: [
        // Structured data (JSON-LD)
        props.blok.structured_data ? {
            type: 'application/ld+json',
            innerHTML: props.blok.structured_data
        } : undefined
    ].filter(Boolean)
})

// Log SEO data in development
if (process.dev && props.blok) {
    console.log('SEO Block Data:', {
        title: props.blok.meta_title,
        description: props.blok.meta_description,
        og_image: props.blok.og_image?.filename,
        canonical: props.blok.canonical_url
    })
}
</script>

<style scoped>
/* No visible styles needed - this is a meta component */
</style>