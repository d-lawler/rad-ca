<template>
    <div v-editable="blok">
        <div class="homepage-content">
            <div class="ca-wordmark">
                <NuxtLink to="/exhibitions">
                    <h1>Christopher Anderson</h1>
                </NuxtLink>
            </div>
            <!-- Image Grids -->
            <div v-if="blok.image_grid && blok.image_grid.length" class="image-grids">
                <div v-for="(gridInstance, instanceIndex) in gridInstances" :key="`grid-${instanceIndex}`"
                     :ref="el => { if (el) gridRefs[instanceIndex] = el }"
                     class="grid-instance">
                    <StoryblokComponent
                        v-for="imageGrid in gridInstance"
                        :key="`${imageGrid._uid}-${instanceIndex}`"
                        :blok="imageGrid"
                        :forceShuffledGroups="imageGrid.shuffledGroups" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({ blok: Object })

// Initialize grid layout animations
const { initializeAnimations } = useGridLayout()

// SEO Meta Tags
useSeo(props.blok, {
    fallbackTitle: '',
    fallbackDescription: 'Filmmaker and Photographer.'
})
const gridInstances = ref([])
const gridRefs = ref([])
const observer = ref(null)

// Shuffle array utility
const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Create new grid instance with shuffled order
const createGridInstance = () => {
    const shuffledGrid = shuffleArray(props.blok.image_grid)

    // For each ImageGrid blok, shuffle its groups and images within groups
    return shuffledGrid.map(gridBlok => {
        if (gridBlok.component === 'ImageGrid' && gridBlok.grid_groups) {
            const shuffledGroups = shuffleArray(gridBlok.grid_groups).map(group => {
                // Shuffle images within each group
                if (group.images && Array.isArray(group.images)) {
                    return {
                        ...group,
                        images: shuffleArray(group.images)
                    }
                }
                return group
            })

            return {
                ...gridBlok,
                shuffledGroups: shuffledGroups
            }
        }
        return gridBlok
    })
}

// Add new grid instance
const addGridInstance = () => {
    gridInstances.value.push(createGridInstance())

    nextTick(() => {
        // Set up observer for the new last grid
        setupObserver()
    })
}

// Setup Intersection Observer
const setupObserver = () => {
    if (observer.value) {
        observer.value.disconnect()
    }

    if (gridRefs.value.length === 0) return

    const lastGridIndex = gridRefs.value.length - 1
    const lastGrid = gridRefs.value[lastGridIndex]

    if (!lastGrid) return

    observer.value = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Add 2 new grids when last grid comes into view
                    addGridInstance()
                    addGridInstance()
                }
            })
        },
        {
            root: null,
            rootMargin: '100px', // Trigger 100px before grid enters viewport
            threshold: 0.1
        }
    )

    observer.value.observe(lastGrid)
}

onMounted(() => {
    if (props.blok.image_grid && props.blok.image_grid.length) {
        // Start with 3 grid instances (original + 2 ahead)
        // First grid keeps original order but still shuffles groups and images
        const firstGrid = props.blok.image_grid.map(gridBlok => {
            if (gridBlok.component === 'ImageGrid' && gridBlok.grid_groups) {
                const shuffledGroups = shuffleArray(gridBlok.grid_groups).map(group => {
                    // Shuffle images within each group
                    if (group.images && Array.isArray(group.images)) {
                        return {
                            ...group,
                            images: shuffleArray(group.images)
                        }
                    }
                    return group
                })

                return {
                    ...gridBlok,
                    shuffledGroups: shuffledGroups
                }
            }
            return gridBlok
        })

        gridInstances.value = [
            firstGrid,
            createGridInstance(),
            createGridInstance()
        ]

        nextTick(() => {
            setupObserver()
            // Initialize inview blur animations for grid images
            initializeAnimations()
        })
    }
})

onUnmounted(() => {
    if (observer.value) {
        observer.value.disconnect()
    }
})
</script>