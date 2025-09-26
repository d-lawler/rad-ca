<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <CustomCursor />
    <Cart />
  </div>
</template>

<script setup>
// Global app setup can go here
// This is the root component that wraps everything

// Add some basic SEO defaults at app level
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { charset: 'utf-8' }
  ]
})

// Log that app is loaded in development
if (process.dev) {
  console.log('🚀 App.vue loaded - Base meta tags applied')
}
</script>

<style>
/* Global styles can be added here if needed */
/* Most styling should be in your SCSS files */
</style>