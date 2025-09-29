<template>
    <ClientOnly>
        <Transition name="blur-fade">
            <div v-if="isOpen" class="homepage-lightbox-overlay" @click="closeLightbox">
                <div class="homepage-lightbox-content" @click.stop>
                    <div class="lightbox-images">
                        <ImageCarousel
                            v-if="images && images.length > 1"
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

// Local reactive state
const localCurrentIndex = ref(0)

// Sync local index with global state
watch(currentIndex, (newIndex) => {
    localCurrentIndex.value = newIndex
}, { immediate: true })

// Current image computed
const currentImage = computed(() => {
    return images.value[localCurrentIndex.value]
})

// Carousel data for ImageCarousel component
const carouselData = computed(() => ({
    images: images.value.map(image => ({
        asset: {
            filename: image.filename,
            alt: image.alt
        },
        _uid: `lightbox-carousel-${Math.random()}`
    })),
    initialSlide: currentIndex.value
}))

// Handle slide changes from carousel
const onSlideChange = (slideIndex) => {
    localCurrentIndex.value = slideIndex
    currentIndex.value = slideIndex
}

// Close lightbox
const closeLightbox = () => {
    closeGlobalLightbox()
}

// Keyboard navigation
const handleKeydown = (event) => {
    if (!isOpen.value) return

    if (event.key === 'Escape') {
        closeLightbox()
    } else if (event.key === 'ArrowLeft' && localCurrentIndex.value > 0) {
        const newIndex = localCurrentIndex.value - 1
        localCurrentIndex.value = newIndex
        currentIndex.value = newIndex
    } else if (event.key === 'ArrowRight' && localCurrentIndex.value < images.value.length - 1) {
        const newIndex = localCurrentIndex.value + 1
        localCurrentIndex.value = newIndex
        currentIndex.value = newIndex
    }
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