<template>
    <div v-editable="blok">
        <div class="container additional-padding">
            <div class="show-grid single-exhibition">
                <div class="exhibition-item col-span-6 exhibition-size-medium">
                    <div @click="openPopup" class="block h-full cursor-pointer">
                        <div class="flex gap-4 h-full">
                            <div class="flex-1 exhibition-text-wrapper flex flex-col justify-center">
                                <div v-if="blok.heading" class="exhibition-heading">
                                    <h3>{{ blok.heading }}</h3>
                                </div>
                                <div v-if="blok.start_date">
                                    <span class="timeplace">Date ({{ getExhibitionStatus(blok) }})<br />
                                        <span v-if="blok.start_date">
                                            {{ formatDate(blok.start_date) }}
                                        </span>
                                        <span v-if="blok.end_date">
                                            - {{ formatDate(blok.end_date) }}
                                        </span>
                                    </span>
                                </div>
                                <div v-if="blok.location" class="exhibition-location">
                                    <span class="timeplace">Location <br />
                                        {{ blok.location }}</span>
                                </div>
                                <div v-if="blok.description"
                                    class="exhibition-description type-body"
                                    v-html="renderRichText(blok.description)"></div>
                            </div>
                            <!-- Image Carousel -->
                            <div class="flex-1 exhibition-image-wrapper">
                                <div v-if="getExhibitionImages(blok).length"
                                    class="exhibition-carousel">
                                    <div class="carousel-container">
                                        <div v-for="(imageUrl, index) in getExhibitionImages(blok)"
                                            :key="index" class="carousel-image"
                                            :class="{ 'active': index === currentImageIndex }">
                                            <NuxtImg :src="imageUrl"
                                                :alt="`${blok.heading} image ${index + 1}`"
                                                class="exhibition-image" format="webp"
                                                quality="70" loading="lazy" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Transition name="blur-fade">
            <div v-if="showPopup" class="story-popup popup-red popup-right wide tall" @click="showPopup = false">
                <div class="story-popup-content" @click.stop>
                    <div v-if="getExhibitionImages(blok).length"
                        class="popup-images">
                        <div v-for="(imageUrl, index) in getExhibitionImages(blok)"
                            :key="index" class="image" :class="{ 'active': index === popupImageIndex }">
                            <NuxtImg :src="imageUrl" :alt="`${blok.heading} image ${index + 1}`"
                                format="webp" quality="20" loading="lazy" />
                        </div>
                    </div>
                    <div class="popup-text">
                        <div class="text-content">
                            <h3>{{ blok.heading }}</h3>
                            <button class="close-btn" @click="showPopup = false">&times;</button>
                        </div>
                        <div v-if="blok.full_text"
                            v-html="renderRichText(blok.full_text)" />
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { renderRichText } from '@storyblok/vue'

const props = defineProps({ blok: Object })
const showPopup = ref(false)
const popupImageIndex = ref(0)
const popupCarouselInterval = ref(null)
const currentImageIndex = ref(0)
const carouselInterval = ref(null)

const getExhibitionImages = (content) => {
    const images = []

    // Add featured image first if it exists
    if (content?.featured_image?.filename) {
        images.push(content.featured_image.filename)
    }

    // Add images from content array (new JSON structure)
    if (content?.content && Array.isArray(content.content)) {
        content.content.forEach(item => {
            // Handle direct asset objects in content array
            if (item.fieldtype === 'asset' && item.filename) {
                images.push(item.filename)
            }
            // Keep support for ImageRow blocks (legacy structure)
            else if (item.component === 'ImageRow' && item.images) {
                item.images.forEach(imageItem => {
                    if (imageItem.image?.filename) {
                        images.push(imageItem.image.filename)
                    }
                })
            }
        })
    }

    return images
}

const getExhibitionStatus = (content) => {
    if (!content.start_date && !content.end_date) {
        return 'Upcoming'
    }

    const now = new Date()
    const startDate = content.start_date ? new Date(content.start_date) : null
    const endDate = content.end_date ? new Date(content.end_date) : null

    if (startDate && endDate) {
        if (now < startDate) {
            return 'Upcoming'
        } else if (now >= startDate && now <= endDate) {
            return 'Running'
        } else {
            return 'Closed'
        }
    } else if (startDate && !endDate) {
        if (now < startDate) {
            return 'Upcoming'
        } else {
            return 'Running'
        }
    } else if (!startDate && endDate) {
        if (now <= endDate) {
            return 'Running'
        } else {
            return 'Closed'
        }
    }

    return 'Upcoming'
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

const startCarousel = () => {
    const imageCount = getExhibitionImages(props.blok).length
    if (imageCount <= 1) return

    currentImageIndex.value = 0
    carouselInterval.value = setInterval(() => {
        currentImageIndex.value = (currentImageIndex.value + 1) % imageCount
    }, 3000) // Change image every 3 seconds
}

const stopCarousel = () => {
    if (carouselInterval.value) {
        clearInterval(carouselInterval.value)
        carouselInterval.value = null
    }
}

const startPopupCarousel = () => {
    const images = getExhibitionImages(props.blok)
    if (images.length > 1) {
        popupCarouselInterval.value = setInterval(() => {
            popupImageIndex.value = (popupImageIndex.value + 1) % images.length
        }, 3000) // Change image every 3 seconds
    }
}

const stopPopupCarousel = () => {
    if (popupCarouselInterval.value) {
        clearInterval(popupCarouselInterval.value)
        popupCarouselInterval.value = null
    }
}

const openPopup = () => {
    showPopup.value = true
    popupImageIndex.value = 0

    // Start popup carousel after transition
    nextTick(() => {
        startPopupCarousel()
    })
}

// Watch for popup closing to stop carousel
watch(showPopup, (newValue) => {
    if (!newValue) {
        stopPopupCarousel()
    }
})

onMounted(() => {
    const images = getExhibitionImages(props.blok)
    if (images.length > 1) {
        startCarousel()
    }
})

onUnmounted(() => {
    stopCarousel()
    stopPopupCarousel()
})
</script>