<template>
    <div>
        <Header />
        <slot />
    </div>
</template>

<script setup>
// Default layout that ensures consistent SEO handling
// This layout wraps all pages and provides fallback SEO

// Set up default site-wide SEO meta tags
useHead({
    titleTemplate: '%s - Christopher Anderson',
    meta: [
        { name: 'author', content: 'Christopher Anderson' },
        { property: 'og:site_name', content: 'Christopher Anderson' },    ]
})
</script>