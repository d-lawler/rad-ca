<template>
    <div v-editable="blok">
        <div class="ca-exhibitions-title" ref="titleElement">
            <h1 @click="scrollToGrid">Exhibitions & Shows</h1>
        </div>
        <div class="container additional-padding">
            <div v-if="exhibitions.length" class="grid grid-cols-12 gap-6 w-full show-grid" ref="gridElement">

                <div v-for="exhibition in exhibitions" :key="exhibition.story.uuid" class="exhibition-item" :class="[
                    exhibition.size === 'small' ? 'col-span-4 exhibition-size-small' : '',
                    exhibition.size === 'medium' ? 'col-span-6 exhibition-size-medium' : '',
                    exhibition.size === 'large' ? 'col-span-8 exhibition-size-large' : '',
                    !exhibition.size || exhibition.size === 'medium' ? 'col-span-6 exhibition-size-medium' : ''
                ]">
                    <div @click="openPopup(exhibition)" class="block h-full cursor-pointer">
                        <div class="flex gap-4 h-full">
                            <div class="flex-1 exhibition-text-wrapper flex flex-col justify-center">
                                <div v-if="exhibition.story.content?.heading" class="exhibition-heading">
                                    <h3>{{ exhibition.story.content.heading }}</h3>
                                </div>
                                <div v-if="exhibition.story.content.start_date">
                                    <span class="timeplace">Date ({{ exhibition.status }})<br />
                                        <span v-if="exhibition.story.content.end_date">
                                            {{ formatDate(exhibition.story.content.start_date) }}
                                        </span>
                                        <span v-if="exhibition.story.content.end_date">
                                            - {{ formatDate(exhibition.story.content.end_date) }}
                                        </span>
                                    </span>
                                </div>
                                <div v-if="exhibition.story.content?.location" class="exhibition-location">
                                    <span class="timeplace">Location <br />
                                        {{ exhibition.story.content.location }}</span>
                                </div>
                                <div v-if="exhibition.story.content?.description"
                                    class="exhibition-description type-body"
                                    v-html="renderRichText(exhibition.story.content.description)"></div>
                            </div>
                            <!-- Image Carousel -->
                            <div class="flex-1 exhibition-image-wrapper">
                                <div v-if="getExhibitionImages(exhibition.story.content).length"
                                    class="exhibition-carousel">
                                    <div class="carousel-container">
                                        <div v-for="(imageUrl, index) in getExhibitionImages(exhibition.story.content)"
                                            :key="index" class="carousel-image"
                                            :class="{ 'active': index === getCarouselIndex(exhibition.story.uuid) }">
                                            <NuxtImg :src="imageUrl"
                                                :alt="`${exhibition.story.name} image ${index + 1}`"
                                                class="exhibition-image w-1/2 h-auto object-contain" loading="lazy" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <Transition name="popup">
            <div v-if="showPopup" class="story-popup popup-red popup-right" @click="showPopup = false">
                <div class="story-popup-content" @click.stop>
                    <button class="close-btn" @click="showPopup = false">&times;</button>
                    <div v-if="selectedExhibition"
                        v-html="renderRichText(selectedExhibition.story.content.full_text)" />
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { renderRichText } from '@storyblok/vue'

const props = defineProps({ blok: Object })
const exhibitions = ref([])
const titleElement = ref(null)
const gridElement = ref(null)
const showPopup = ref(false)
const selectedExhibition = ref(null)
const carouselIndexes = ref({})
const carouselIntervals = ref({})

const storyblokApi = useStoryblokApi()

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

const getCarouselIndex = (exhibitionId) => {
    return carouselIndexes.value[exhibitionId] || 0
}

const startCarousel = (exhibitionId, imageCount) => {
    if (imageCount <= 1) return

    carouselIndexes.value[exhibitionId] = 0
    carouselIntervals.value[exhibitionId] = setInterval(() => {
        carouselIndexes.value[exhibitionId] = (carouselIndexes.value[exhibitionId] + 1) % imageCount
    }, 3000) // Change image every 3 seconds
}

const stopCarousel = (exhibitionId) => {
    if (carouselIntervals.value[exhibitionId]) {
        clearInterval(carouselIntervals.value[exhibitionId])
        delete carouselIntervals.value[exhibitionId]
    }
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

const handleScroll = () => {
    if (!titleElement.value) return

    const scrollY = window.scrollY
    const fadeOutPoint = window.innerHeight * 0.2 // 20vh

    let opacity = 1
    if (scrollY > 0) {
        opacity = Math.max(0, 1 - (scrollY / fadeOutPoint))
    }

    titleElement.value.style.opacity = opacity

    // Make h1 clickable when visible, but not when faded out
    if (opacity > 0.1) {
        titleElement.value.querySelector('h1').style.pointerEvents = 'auto'
    } else {
        titleElement.value.querySelector('h1').style.pointerEvents = 'none'
    }
}

const scrollToGrid = () => {
    if (!gridElement.value) return

    gridElement.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    })
}

const openPopup = (exhibition) => {
    selectedExhibition.value = exhibition
    showPopup.value = true

    // Set all links to open in new window after popup is rendered
    nextTick(() => {
        const popup = document.querySelector('.story-popup')
        if (popup) {
            const links = popup.querySelectorAll('a')
            links.forEach(link => {
                link.setAttribute('target', '_blank')
                link.setAttribute('rel', 'noopener noreferrer')
            })
        }
    })
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

onMounted(async () => {
    if (props.blok.exhibitions && Array.isArray(props.blok.exhibitions)) {
        try {
            const fetched = await Promise.all(
                props.blok.exhibitions.map(async (item) => {
                    let uuid, size = 'medium'

                    if (typeof item === 'string') {
                        // Old format: just UUID
                        uuid = item
                    } else if (item && item.component === 'ExhibitionItem' && item.exhibition) {
                        // New format: ExhibitionItem block from Storyblok
                        uuid = item.exhibition
                        size = item.size || 'medium'
                    } else if (item && item.exhibition) {
                        // Fallback: object with exhibition reference
                        uuid = item.exhibition
                        size = item.size || 'medium'
                    } else {
                        return null
                    }

                    const { data } = await storyblokApi.get(`cdn/stories`, {
                        by_uuids: uuid
                    })

                    if (!data.stories || data.stories.length === 0) {
                        return null
                    }

                    const story = data.stories[0]
                    const status = getExhibitionStatus(story.content)

                    return {
                        story: story,
                        size: size,
                        status: status
                    }
                })
            )
            exhibitions.value = fetched.filter(item => item && item.story)

            // Start carousels for exhibitions with multiple images
            exhibitions.value.forEach(exhibition => {
                const images = getExhibitionImages(exhibition.story.content)
                if (images.length > 1) {
                    startCarousel(exhibition.story.uuid, images.length)
                }
            })
        } catch (error) {
            console.error('Error fetching exhibitions:', error)
        }
    }

    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)

    // Clean up all carousel intervals
    Object.keys(carouselIntervals.value).forEach(exhibitionId => {
        stopCarousel(exhibitionId)
    })
})
</script>