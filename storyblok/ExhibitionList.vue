<template>
    <div v-editable="blok" class="exhibition-list">
        <h2 v-if="blok.heading" class="exhibition-list-heading">
            {{ blok.heading }}
        </h2>

        <div v-if="blok.exhibitions && blok.exhibitions.length" class="exhibitions-grid">
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
