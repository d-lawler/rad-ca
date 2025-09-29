<template>
    <footer class="Footer">
        <!-- Only show grid controls on homepage -->
        <nav v-if="isHomepage">
            <div
                class="Link"
                :class="{ active: gridMode === 'scattered' }"
                @click="setScattered"
            >
                Scattered
            </div>
            <div
                class="Link"
                :class="{ active: gridMode === 'arranged' }"
                @click="setArranged"
            >
                Arranged
            </div>
        </nav>
    </footer>
</template>

<script setup>
const route = useRoute()

// Check if we're on the homepage
const isHomepage = computed(() => {
    return route.path === '/' || route.name === 'index' || route.path === '/home'
})

// Initialize grid layout functions with proper fallbacks
let gridMode = ref('scattered')
let setScattered = ref(() => {})
let setArranged = ref(() => {})

// Setup grid functionality immediately on homepage
if (process.client && isHomepage.value) {
    try {
        const gridLayout = useGridLayout()
        gridMode = gridLayout.gridMode
        setScattered.value = gridLayout.setScattered
        setArranged.value = gridLayout.setArranged
    } catch (error) {
        console.warn('Grid layout initialization failed:', error)
    }
} else if (process.client) {
    // For non-homepage pages, use onMounted to check after route is fully resolved
    onMounted(() => {
        if (isHomepage.value) {
            try {
                const gridLayout = useGridLayout()
                gridMode = gridLayout.gridMode
                setScattered.value = gridLayout.setScattered
                setArranged.value = gridLayout.setArranged
            } catch (error) {
                console.warn('Grid layout initialization failed:', error)
            }
        }
    })
}
</script>