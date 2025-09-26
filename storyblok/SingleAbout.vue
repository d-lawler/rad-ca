<template>
    <div v-editable="blok">
        <div class="container additional-padding">
            <div class="about-page-grid">
                <div class="about-main-content">
                    <div v-html="renderRichText(blok.story_text)" />
                </div>

                <div v-if="blok.exhibition_lists && blok.exhibition_lists.length" class="about-exhibitions-sidebar">
                    <StoryblokComponent v-for="exhibitionList in blok.exhibition_lists" :key="exhibitionList._uid" :blok="exhibitionList" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { renderRichText } from '@storyblok/vue'

const props = defineProps({ blok: Object })

// SEO Meta Tags
useSeo(props.blok, {
    fallbackTitle: 'About Christopher Anderson - Artist Biography',
    fallbackDescription: 'Learn about Christopher Anderson, contemporary artist and photographer. Discover his background, artistic vision, and creative journey.'
})
</script>