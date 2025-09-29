<template>
    <div v-editable="blok" class="image-grid-container">
        <!-- Single scrolling grid with large buffer zones -->
        <div class="image-grid">
            <StoryblokComponent
                v-for="group in displayGroups"
                :key="group._uid"
                :blok="group"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
    blok: Object,
    forceShuffledGroups: Array // Accept pre-shuffled groups from parent
})

// Randomized groups
const randomizedGroups = ref([])
let isProcessing = false
let observer = null

// Shuffle function
const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Use global grid layout animations
const { setupInviewAnimations } = useGridLayout()

// Only enable scroll detection if not using forced groups (infinite scroll mode)
const handleScroll = () => {
    if (isProcessing || props.forceShuffledGroups) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    // Detect when user reaches the very bottom
    if (scrollTop + windowHeight >= documentHeight - 50) {
        triggerReshuffle()
    }
}

// Reshuffle grid and jump back to top (only for legacy mode)
const triggerReshuffle = () => {
    if (isProcessing || props.forceShuffledGroups) return

    isProcessing = true

    // Reshuffle the grid content
    if (props.blok.grid_groups && props.blok.grid_groups.length > 0) {
        randomizedGroups.value = shuffleArray(props.blok.grid_groups)
    }

    // Jump back to the very top of the page
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // Reset custom animations for new content
    setTimeout(() => {
        setupInviewAnimations()
    }, 100)

    isProcessing = false
}

// Initialize randomized groups
onMounted(() => {
    // Use forced groups if provided, otherwise shuffle original groups
    if (props.forceShuffledGroups && props.forceShuffledGroups.length > 0) {
        randomizedGroups.value = props.forceShuffledGroups
    } else if (props.blok.grid_groups && props.blok.grid_groups.length > 0) {
        randomizedGroups.value = shuffleArray(props.blok.grid_groups)
    }

    // Only manage scroll behavior if not in infinite scroll mode
    if (!props.forceShuffledGroups) {
        // Start at the very top of the page
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0

        // Add scroll listener
        window.addEventListener('scroll', handleScroll)
    }

    // Setup custom inview animations
    setTimeout(() => {
        setupInviewAnimations()
    }, 100)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (observer) {
        observer.disconnect()
    }
})

// Use randomized groups or fallback to original
const displayGroups = computed(() => {
    return randomizedGroups.value.length > 0 ? randomizedGroups.value : props.blok.grid_groups || []
})
</script>