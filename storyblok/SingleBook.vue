<template>
    <div v-editable="blok" class="single-project-container">
        <!-- Book title (outside content container) -->
        <h1 class="project-title-overlay">
            <button class="project-title-button" @click="toggleBookInfo()">
                {{ blok.name || 'Book' }}
                <span class="project-ino-button">(I)</span>
            </button>
        </h1>

        <div class="project-content-expanded container content-expanded-visible" @scroll="handleScroll">
            <div class="project-content content-clicked">
                <!-- Thumbnail -->
                <div class="project-thumbnail thumbnail-visible">
                    <NuxtImg v-if="blok.featured_image" :src="blok.featured_image.filename"
                        :alt="blok.featured_image.alt || blok.name" class="project-featured-media" loading="lazy" />
                </div>
                <!-- Content blocks -->
                <div v-if="blok.content && blok.content.length" class="project-content-blocks">
                    <div v-for="block in blok.content" :key="block._uid" class="content-block">
                        <!-- Handle ImageRow components -->
                        <div v-if="block.component === 'ImageRow'" class="image-row" :class="[
                            `image-row-${block.alignment || 'center'}`
                        ]">
                            <div v-for="imageItem in block.images" :key="imageItem._uid" class="image-item">
                                <NuxtImg v-if="imageItem.component === 'ImageItem' && imageItem.image"
                                    :src="imageItem.image.filename" :alt="imageItem.image.alt || blok.name"
                                    class="project-image" loading="lazy" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Book description popup -->
        <Transition name="popup">
            <div v-if="showBookInfo" class="story-popup popup-left popup-white" @click="showBookInfo = false">
                <div class="story-popup-content" @click.stop>
                    <button class="close-btn" @click="showBookInfo = false">&times;</button>
                    <div v-if="blok.story_text" v-html="renderRichText(blok.story_text)" />
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { renderRichText } from '@storyblok/vue'
import { ref } from 'vue'

const props = defineProps({ blok: Object })
const showBookInfo = ref(false)

const toggleBookInfo = () => {
    showBookInfo.value = true
}

const handleScroll = async (event) => {
    // Optional: Handle scroll behavior for single books
    // Could add scroll-to-top functionality or other interactions
}
</script>