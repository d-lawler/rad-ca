<template>
  <div v-editable="blok">
    <NuxtImg v-if="blok.image" :src="blok.image.filename" :alt="blok.image.alt" format="webp" quality="70" loading="lazy" sizes="sm:200px md:300px lg:400px" />
  </div>
</template>

<script setup>
defineProps({ blok: Object })
</script>