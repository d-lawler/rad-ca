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

// Apply body classes for page identification and device detection
const { applyBodyClasses, removeBodyClasses } = useBodyClasses()

// Apply classes when layout mounts
onMounted(() => {
    applyBodyClasses()
})

// Clean up classes when layout unmounts
onUnmounted(() => {
    removeBodyClasses()
})

// Reapply classes when route changes
const route = useRoute()
watch(() => route.path, () => {
    nextTick(() => {
        applyBodyClasses()
    })
})

// Log layout usage in development
if (process.dev) {
    console.log('🏗️ Default layout loaded - Site-wide SEO and body classes applied')
}
</script>