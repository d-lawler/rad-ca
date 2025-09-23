<script setup>
const { slug } = useRoute().params

const storySlug = Array.isArray(slug) ? slug.join('/') : slug || 'home'
const story = await useAsyncStoryblok(storySlug, { version: 'draft' })
</script>

<template>
    <div v-if="story">
        <StoryblokComponent :blok="story.content" />
    </div>
</template>