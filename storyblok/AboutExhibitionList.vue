<template>
    <div v-editable="blok" class="about-exhibition-list">
        <h2 v-if="blok.heading" class="about-exhibition-list-heading">
            {{ blok.heading }}
        </h2>

        <div v-if="blok.exhibitions && blok.exhibitions.length">
            <StoryblokComponent
                v-for="exhibition in blok.exhibitions"
                :key="exhibition._uid"
                :blok="exhibition"
            />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({ blok: Object })
</script>
