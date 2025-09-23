<template>
  <div v-editable="blok">
    <div v-if="blok.heading">{{ blok.heading }}</div>
    <div v-if="blok.description" v-html="renderRichText(blok.description)" />
    <div v-if="blok.location">{{ blok.location }}</div>
    <NuxtImg v-if="blok.featured_image" :src="blok.featured_image.filename" :alt="blok.featured_image.alt" format="webp" quality="70" loading="lazy" sizes="sm:300px md:400px lg:500px" />
    <div v-if="blok.start_date">{{ blok.start_date }}</div>
    <div v-if="blok.end_date">{{ blok.end_date }}</div>
    <div v-if="blok.type">{{ blok.type }}</div>
  </div>
</template>

<script setup>
import { renderRichText } from '@storyblok/vue'

defineProps({ blok: Object })
</script>