<template>
    <div v-editable="blok" class="image-row" :class="[
        `alignment-${blok.alignment || 'center'}`
    ]">
        <StoryblokComponent v-for="image in blok.images" :key="image._uid" :blok="image" />
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({ blok: Object })

let observer = null

// Custom inview animation (copied from ImageGrid)
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

    // Observe all images in this ImageRow
    const images = document.querySelectorAll('.image-row img')
    images.forEach(img => {
        // Set initial state
        img.style.opacity = '0'
        img.style.filter = 'blur(2rem)'
        img.style.transition = 'opacity 0.8s ease, filter 0.8s ease'

        observer.observe(img)
    })
}

onMounted(() => {
    // Setup custom inview animations
    setTimeout(() => {
        setupInviewAnimations()
    }, 100)
})

onUnmounted(() => {
    if (observer) {
        observer.disconnect()
    }
})
</script>
