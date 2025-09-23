<template>
    <div v-editable="blok" class="image-row" :class="[
        `alignment-${blok.alignment || 'center'}`
    ]">
        <StoryblokComponent v-for="image in blok.images" :key="image._uid" :blok="image" />
    </div>
</template>

<script setup>
const props = defineProps({ blok: Object })
</script>
