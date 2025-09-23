<template>
    <div v-editable="blok" class="image-grid-group" :data-group-id="blok._uid">
        <template v-for="(media, index) in (Array.isArray(blok.images) ? blok.images : [blok.images])" :key="`${blok._uid}-${index}`">
            <!-- Video handling -->
            <video
                v-if="isVideo(media)"
                :src="media.filename"
                class="grid-image"
                autoplay
                muted
                loop
                playsinline
                :aria-label="media.alt || `Video ${index + 1}`"
            />

            <!-- Image handling with NuxtImg -->
            <NuxtImg
                v-else
                :src="media.filename"
                :alt="media.alt || `Gallery image ${index + 1}`"
                class="grid-image"
                loading="lazy"
                format="webp"
                quality="25"
                sizes="sm:200px md:200px lg:200px xl:200px"
                @load="onImageLoad"
                @error="onImageError"
            />
        </template>
    </div>
</template>
<script setup>
const props = defineProps({ blok: Object })

// Function to detect if media is a video
const isVideo = (media) => {
    if (!media || !media.filename) return false
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']
    const filename = media.filename.toLowerCase()
    return videoExtensions.some(ext => filename.includes(ext))
}

// Simple staggered delay calculation
const getStaggeredDelay = (index) => {
    return index * 50
}

// Image loading handlers
const onImageLoad = (event) => {
    const img = event.target
    img.style.opacity = '1'
}

const onImageError = (event) => {
    const img = event.target
    img.style.opacity = '0'
}
</script>