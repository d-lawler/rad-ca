<template>
    <div v-if="blok.asset" class="asset-component" :class="sizeClasses">
        <NuxtImg v-if="isImage" :src="blok.asset.filename" :alt="blok.asset.alt || blok.asset.name"
            :width="blok.asset.meta_data?.width" :height="blok.asset.meta_data?.height" loading="lazy" />
        <video v-else-if="isVideo" :src="blok.asset.filename" controls preload="metadata">
        </video>
    </div>
</template>

<script setup>
const props = defineProps(['blok'])

const isImage = computed(() => {
    return props.blok.asset?.content_type?.startsWith('image/')
})

const isVideo = computed(() => {
    return props.blok.asset?.content_type?.startsWith('video/')
})
</script>