<template>
    <div v-editable="blok" class="exhibition-item">
        <div v-if="blok.text" class="exhibition-text">
            {{ blok.text }}
        </div>
    </div>
</template>

<script setup>
const props = defineProps({ blok: Object })
</script>
