<template>
    <div v-editable="blok" class="image-carousel">
        <Carousel
            ref="carousel"
            :items-to-show="itemsToShow"
            :wrap-around="carouselSettings.wrapAround"
            :transition="carouselSettings.transition || 500"
            v-model="currentSlide"
            @slide-start="onSlideChange"
            :settings="carouselSettings"
        >
            <Slide
                v-for="(assetComponent, index) in blok.images"
                :key="assetComponent._uid"
            >
                <div class="carousel-slide-content">
                    <NuxtImg
                        :src="assetComponent.asset?.filename || assetComponent.filename"
                        :alt="assetComponent.asset?.alt || assetComponent.alt || `Image ${index + 1}`"
                        class="carousel-image"
                    />
                </div>
            </Slide>
        </Carousel>

        <!-- Large invisible navigation buttons -->
        <button v-if="blok?.images?.length > 1" class="carousel-nav-btn carousel-nav-prev" @click="goToPrev" aria-label="Previous image"></button>
        <button v-if="blok?.images?.length > 1" class="carousel-nav-btn carousel-nav-next" @click="goToNext" aria-label="Next image"></button>
    </div>
</template>

<script setup>
const props = defineProps({ blok: Object })
const emit = defineEmits(['slideChange'])
const currentSlide = ref(props.blok?.initialSlide || 0)
const windowWidth = ref(0)
const carousel = ref(null)
let observer = null

const itemsToShow = computed(() => {
    return windowWidth.value <= 768 ? 1 : 1.5
})

const carouselSettings = computed(() => ({
    snapAlign: 'center',
    wrapAround: props.blok?.wrapAround !== undefined ? props.blok.wrapAround : (props.blok?.images?.length > 1),
    autoplay: (props.blok?.autoplay || false) && props.blok?.images?.length > 1,
    autoplayTimeout: props.blok?.autoplay_interval || 5000,
    itemsToScroll: 1,
    mouseDrag: props.blok?.images?.length > 1,
    touchDrag: props.blok?.images?.length > 1,
    transition: props.blok?.transition || 500,
}))

const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth
}

const goToPrev = () => {
    if (carousel.value) {
        carousel.value.prev()
    }
}

const goToNext = () => {
    if (carousel.value) {
        carousel.value.next()
    }
}

const onSlideChange = (data) => {
    currentSlide.value = data.currentSlideIndex
    emit('slideChange', data.currentSlideIndex)
}

// Method to set initial slide without transition
const setInitialSlide = () => {
    if (carousel.value && props.blok?.initialSlide !== undefined) {
        // Use slideTo with no transition for initial positioning
        nextTick(() => {
            carousel.value.slideTo(props.blok.initialSlide, { transition: false })
        })
    }
}

// Custom inview animation for container (copied from ImageGrid)
const setupInviewAnimations = () => {
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1'
                entry.target.style.filter = 'blur(0rem)'
            }
        })
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    })

    // Observe the image carousel container
    const carouselContainers = document.querySelectorAll('.image-carousel')
    carouselContainers.forEach(container => {
        // Set initial state
        container.style.opacity = '0'
        container.style.filter = 'blur(2rem)'
        container.style.transition = 'opacity 0.8s ease, filter 0.8s ease'

        observer.observe(container)
    })
}

onMounted(() => {
    updateWindowWidth()
    window.addEventListener('resize', updateWindowWidth)

    // Set initial slide without transition
    setTimeout(() => {
        setInitialSlide()
    }, 50)

    // Setup custom inview animations
    setTimeout(() => {
        setupInviewAnimations()
    }, 100)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth)
    if (observer) {
        observer.disconnect()
    }
})
</script>

<style scoped>
.image-carousel {
    width: 100vw;
    margin-left: -3.75rem !important;
    margin-right: -3.75rem !important;
    position: relative;
}

.image-carousel img {
    height: 70vh;
}

/* Large invisible navigation buttons */
.carousel-nav-btn {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50%;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 10;
    opacity: 0;
}

.carousel-nav-prev {
    left: 0;
}

.carousel-nav-next {
    right: 0;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
    .image-carousel {
        margin-left: -2rem !important;
        margin-right: -2rem !important;
    }

    .image-carousel img {
        height: 50vh;
    }
}

@media (max-width: 480px) {
    .image-carousel {
        margin-left: -1.25rem !important;
        margin-right: -1.25rem !important;
    }

    .image-carousel img {
        height: 40vh;
    }
}
</style>