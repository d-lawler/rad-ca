<template>
    <div class="marquee-container">
        <div class="marquee-track" :style="{ animationDuration: `${duration}s` }">
            <div v-for="image in doubledImages" :key="image.id" class="marquee-item">
                <NuxtImg
                    :src="image.src"
                    :alt="image.alt"
                    class="marquee-image"
                    loading="lazy"
                    format="webp"
                    quality="30"
                    sizes="150px"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    images: {
        type: Array,
        required: true
    },
    duration: {
        type: Number,
        default: 30
    }
})

// Double the images array for seamless looping
const doubledImages = computed(() => {
    const doubled = [...props.images, ...props.images]
    return doubled.map((image, index) => ({
        ...image,
        id: `${image.id || index}-${index}`
    }))
})
</script>

<style scoped>
.marquee-container {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    margin: 1rem 0;
}

.marquee-track {
    display: inline-flex;
    gap: 1rem;
    animation: marquee linear infinite;
    will-change: transform;
}

.marquee-item {
    flex-shrink: 0;
}

.marquee-image {
    width: 150px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    display: block;
}

@keyframes marquee {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-50%);
    }
}

.marquee-track:hover {
    animation-play-state: paused;
}
</style>