<template>
    <div v-editable="blok" class="image-item" :class="`size-${blok.size || 'half'}`">
        <!-- Video handling -->
        <video
            v-if="isVideo(blok.image)"
            :src="blok.image.filename"
            class="item-media"
            autoplay
            muted
            loop
            playsinline
            :aria-label="blok.image.alt || `Video ${blok.image.id}`"
        />

        <!-- Image handling with NuxtImg -->
        <NuxtImg
            v-else-if="blok.image"
            :src="blok.image.filename"
            :alt="blok.image.alt || `Image ${blok.image.id}`"
            class="item-media"
            loading="lazy"
            format="webp"
            quality="70"
            :sizes="getSizes(blok.size)"
        />
    </div>
</template>

<script setup>
const props = defineProps({ blok: Object })

// Function to detect if media is a video
const isVideo = (media) => {
    if (!media || !media.filename) return false
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']
    const filename = media.filename.toLowerCase()
    return videoExtensions.some(ext => filename.includes(ext))
}

// Function to get responsive sizes based on image size
const getSizes = (size) => {
    const sizeMap = {
        quarter: 'xs:80px sm:120px md:200px lg:250px',
        third: 'xs:100px sm:160px md:266px lg:333px',
        half: 'xs:160px sm:200px md:400px lg:500px',
        twothirds: 'xs:200px sm:266px md:533px lg:666px',
        full: 'xs:320px sm:640px md:800px lg:1000px'
    }
    return sizeMap[size] || sizeMap.half
}
</script>
