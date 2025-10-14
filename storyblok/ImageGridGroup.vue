<template>
    <div
        v-editable="blok"
        class="image-grid-group"
        :data-group-id="blok._uid"
        :class="{ 'grid-transitioning': isTransitioning }"
        :style="{ opacity: isTransitioning ? 0.3 : 1 }"
    >
        <!-- Grid group title for arranged mode -->
        <div
            v-if="gridMode === 'arranged'"
            class="grid-group-title"
        >
            <span class="grid-group-title-text">{{ blok.title || 'CMS Heading' }}</span>
        </div>

        <template v-for="(media, index) in (Array.isArray(blok.images) ? blok.images : [blok.images])" :key="`${blok._uid}-${index}`">
            <!-- Video handling -->
            <video
                v-if="isVideo(media)"
                :src="media.filename"
                :class="`grid-image ${gridMode}`"
                autoplay
                muted
                loop
                playsinline
                :aria-label="media.alt || `Video ${index + 1}`"
            />
            <!-- Image handling -->
            <NuxtImg
                v-else
                :src="media.filename"
                :alt="media.alt || `Gallery image ${index + 1}`"
                :class="`grid-image ${gridMode}`"
                loading="lazy"
                format="webp"
                quality="70"
                sizes="sm:200px md:200px lg:200px xl:200px"
                @load="onImageLoad"
                @error="onImageError"
                @click="openImagePopup(index)"
                style="cursor: pointer;"
            />
        </template>

    </div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({ blok: Object })

// Use the global homepage lightbox
const { openLightbox } = useHomepageLightbox()

// Use the global grid layout state
const { gridMode, isTransitioning } = useGridLayout()

// Function to detect if media is a video
const isVideo = (media) => {
    if (!media || !media.filename) return false
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']
    const filename = media.filename.toLowerCase()
    return videoExtensions.some(ext => filename.includes(ext))
}

// Filter out videos to get only images for the carousel
const imageList = computed(() => {
    const mediaArray = Array.isArray(props.blok.images) ? props.blok.images : [props.blok.images]
    return mediaArray.filter(media => !isVideo(media))
})

// Open image popup using global lightbox
const openImagePopup = (clickedIndex) => {
    console.log('Image clicked! Index:', clickedIndex)
    console.log('Image list:', imageList.value)

    if (imageList.value.length > 0) {
        // Convert the original media index to filtered image index
        const mediaArray = Array.isArray(props.blok.images) ? props.blok.images : [props.blok.images]
        let imageCount = 0

        for (let i = 0; i <= clickedIndex; i++) {
            if (mediaArray[i] && !isVideo(mediaArray[i])) {
                if (i === clickedIndex) {
                    console.log('Opening lightbox with imageCount:', imageCount)
                    // Open the global lightbox with all images from this group
                    openLightbox(
                        imageList.value,
                        imageCount,
                        props.blok.title || 'Gallery'
                    )
                    break
                }
                imageCount++
            }
        }
    }
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