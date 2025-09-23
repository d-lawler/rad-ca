<template>
    <div v-editable="blok" class="image-carousel">
        <Carousel
            :items-to-show="itemsToShow"
            :wrap-around="true"
            :transition="500"
            v-model="currentSlide"
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
    </div>
</template>

<script setup>
const props = defineProps({ blok: Object })
const currentSlide = ref(0)
const windowWidth = ref(0)

const itemsToShow = computed(() => {
    return windowWidth.value <= 768 ? 1 : 1.5
})

const carouselSettings = {
    snapAlign: 'center',
    wrapAround: true,
    autoplay: props.blok?.autoplay || false,
    autoplayTimeout: props.blok?.autoplay_interval || 5000,
    itemsToScroll: 1,
    mouseDrag: true,
    touchDrag: true,
}

const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth
}

onMounted(() => {
    updateWindowWidth()
    window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth)
})
</script>

<style scoped>
.image-carousel {
    width: 100vw;
    margin-left: -3.75rem !important;
    margin-right: -3.75rem !important;
}

.image-carousel img {
    height: 70vh;
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