<template>
    <div
        v-editable="blok"
        class="about-exhibition-item"
        @mousemove="handleMouseMove"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        ref="itemRef"
    >
        <div v-if="blok.rich_text" class="about-exhibition-text">
            <div v-html="renderRichText(blok.rich_text)"></div>
        </div>
        <div
            v-if="blok.image?.filename"
            class="about-exhibition-image"
            :class="{ 'following-cursor': isHovering }"
            :style="imageStyle"
            ref="imageRef"
        >
            <NuxtImg
                :src="blok.image.filename"
                :alt="blok.image.alt || 'Exhibition image'"
                loading="lazy"
                format="webp"
                quality="80"
            />
        </div>
    </div>
</template>

<script setup>
import { renderRichText } from '@storyblok/vue'

const props = defineProps({ blok: Object })

const itemRef = ref(null)
const imageRef = ref(null)
const isHovering = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)

const imageStyle = computed(() => {
    if (!isHovering.value) return {
        opacity: '0',
        visibility: 'hidden'
    }

    return {
        left: `${mouseX.value}px`,
        top: `${mouseY.value}px`,
        position: 'fixed',
        zIndex: '1000',
        pointerEvents: 'none',
        opacity: '1',
        visibility: 'visible'
    }
})

const handleMouseMove = (event) => {
    // Always update mouse position when moving over the item
    mouseX.value = event.clientX + 20
    mouseY.value = event.clientY + 20
}

const handleMouseEnter = () => {
    isHovering.value = true
}

const handleMouseLeave = () => {
    isHovering.value = false
    mouseX.value = 0
    mouseY.value = 0
}
</script>
