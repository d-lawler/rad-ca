<template>
    <ClientOnly>
        <Transition name="blur-fade">
            <div v-if="isOpen" class="homepage-lightbox-overlay" @click="closeLightbox">
                <div class="homepage-lightbox-content" @click.stop>
                    <div class="lightbox-images">
                        <ImageCarousel
                            v-if="images && images.length > 1 && carouselData"
                            :key="`lightbox-carousel-${carouselKey}`"
                            :blok="carouselData"
                            @slideChange="onSlideChange"
                        />
                        <NuxtImg
                            v-else-if="images && images.length === 1"
                            :src="images[0].filename"
                            :alt="images[0].alt || 'Gallery image'"
                            format="webp"
                            quality="100"
                            loading="eager"
                            class="single-lightbox-image"
                        />
                    </div>
                    <div class="lightbox-caption">
                        <p>{{ groupTitle || 'Group title from CMS' }}</p>
                        <p>{{ currentImage?.alt || `Image ${currentIndex + 1} title from CMS` }}</p>
                        <p>Image {{ currentIndex + 1 }} of {{ (images && images.length) || 0 }}</p>
                    </div>
                    <button class="lightbox-close-btn" @click="closeLightbox">&times;</button>
                </div>
            </div>
        </Transition>
    </ClientOnly>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Global lightbox state
const {
    isOpen,
    images,
    currentIndex,
    groupTitle,
    openLightbox: openGlobalLightbox,
    closeLightbox: closeGlobalLightbox
} = useHomepageLightbox()

// Debug watcher
watch(isOpen, (newValue) => {
    console.log('HomepageLightbox: isOpen changed to:', newValue)
    if (newValue) {
        console.log('HomepageLightbox: images:', images.value)
        console.log('HomepageLightbox: currentIndex:', currentIndex.value)
        console.log('HomepageLightbox: groupTitle:', groupTitle.value)
    }
}, { immediate: true })

// Local state for carousel management
const stableCarouselData = ref(null)
const carouselKey = ref(0)

// Current image computed directly from global state
const currentImage = computed(() => {
    if (!images.value || !images.value.length) return null
    return images.value[currentIndex.value]
})

// Create stable carousel data when lightbox opens
watch([isOpen, images], ([isOpenValue, imagesValue]) => {
    if (isOpenValue && imagesValue && imagesValue.length > 0) {
        console.log('Creating stable carousel data with initialSlide:', currentIndex.value)

        // Create new carousel data with current index as initial slide
        stableCarouselData.value = {
            images: imagesValue.map((image, index) => ({
                asset: {
                    filename: image.filename,
                    alt: image.alt
                },
                _uid: `lightbox-carousel-${index}`
            })),
            initialSlide: currentIndex.value,
            // Add carousel settings optimized for lightbox
            autoplay: false, // Never autoplay in lightbox
            autoplay_interval: 0,
            // Force infinite scrolling for seamless navigation
            wrapAround: true,
            // Normal transition speed for user interactions
            transition: 500,
            // Ensure items scroll one at a time for infinite feel
            itemsToScroll: 1
        }

        // Force carousel recreation by updating key
        carouselKey.value++
    }
}, { immediate: true })

// Carousel data - use stable reference
const carouselData = computed(() => stableCarouselData.value)

// Handle slide changes from carousel - only update global state
const onSlideChange = (slideIndex) => {
    console.log('Carousel slide changed to:', slideIndex)
    currentIndex.value = slideIndex
}

// Close lightbox
const closeLightbox = () => {
    closeGlobalLightbox()
}

// Keyboard navigation - let the carousel handle arrow keys
const handleKeydown = (event) => {
    if (!isOpen.value) return

    if (event.key === 'Escape') {
        closeLightbox()
    }
    // Remove manual arrow key handling - let the carousel component handle navigation
    // This prevents conflicts between manual index updates and carousel's internal state
}

// Lifecycle
onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})

// Watch for lightbox open/close to manage body scroll
watch(isOpen, (newValue) => {
    if (process.client) {
        if (newValue) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }
})
</script>
