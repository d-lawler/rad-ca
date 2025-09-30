<template>
    <div v-editable="blok" class="projects-page single-project-page">
        <div v-if="!isAtBottom" class="content-list-item">
            <div class="content container additional-padding" id="scroll-anchor">
                <div class="title" ref="titleElement" style="opacity: 1; transition: opacity 0.3s ease;">
                    <h1 @click="toggleInfoPopup" style="cursor: pointer;">
                        {{ blok.name }}
                        <button class="info-button" @click="toggleInfoPopup">
                            (I<span class="mobile">NFO</span>)
                        </button>
                    </h1>
                </div>
                <div class="images">
                    <div v-for="block in blok.content" :key="block._uid">
                        <StoryblokComponent :blok="block" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Project description popup -->
        <Transition name="blur-fade">
            <div v-if="showInfoPopup" class="story-popup half-width" @click="showInfoPopup = false">
                <div class="story-popup-content" @click.stop>
                    <div class="popup-text">
                        <div class="text-content">
                            <h3>{{ blok.name }}</h3>
                            <button class="close-btn" @click="showInfoPopup = false">&times;</button>
                        </div>
                        <div v-if="blok.story_text"
                            v-html="renderRichText(blok.story_text)"></div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { renderRichText } from '@storyblok/vue'
import { ref } from 'vue'

const props = defineProps({ blok: Object })
const showInfoPopup = ref(false)
const isAtBottom = ref(false)
const titleElement = ref(null)

const toggleInfoPopup = () => {
    console.log('Info button clicked, current state:', showInfoPopup.value)
    showInfoPopup.value = !showInfoPopup.value
    console.log('New state:', showInfoPopup.value)
}
</script>