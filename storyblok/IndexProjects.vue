<template>
    <div v-editable="blok" class="projects-page">
        <!--  -->
        <Transition name="fade-blur" mode="out-in">
            <div v-if="!selectedProject || isAtBottom" class="container additional-padding content-list project-list" key="project-list">
                <a v-for="project in projects" :key="project.uuid" href="javascript:void(0)"
                    @mouseenter="hoveredProject = project; randomPositionClass = 'position-' + ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][Math.floor(Math.random() * 10)]" @mouseleave="hoveredProject = null"
                    @click="selectProject(project)">{{ project.name }}</a>
            </div>
        </Transition>
        <div v-if="!isAtBottom" class=" content-list-item">
            <Transition name="fade-blur" mode="out-in">
                <div v-if="hoveredProject?.content?.featured_image && !selectedProject && hoveredProject" class="thumbnail"
                    :key="hoveredProject?.uuid">
                    <NuxtImg :src="hoveredProject.content.featured_image.filename"
                        :alt="hoveredProject.content.featured_image.alt"
                        :class="randomPositionClass" />
                </div>
            </Transition>
            <Transition name="fade-blur" mode="out-in">
                <div v-if="selectedProject" class="content container additional-padding"
                    :key="selectedProject?.uuid" id="scroll-anchor">
                    <div class="title" ref="titleElement" style="opacity: 0; transition: opacity 0.3s ease;">
                        <h1 @click="toggleInfoPopup" style="cursor: pointer;">
                            {{ selectedProject?.content?.name }}
                            <button class="info-button" @click="toggleInfoPopup">
                                (I<span class="mobile">NFO</span>)
                            </button>
                        </h1>
                    </div>
                    <div class="images">
                        <div v-for="block in selectedProject?.content?.content" :key="block._uid">
                            <StoryblokComponent :blok="block" />
                        </div>
                    </div>
                </div>
            </Transition>
            <!--  -->
            <Transition name="blur-fade">
                <div v-if="showInfoPopup" class="story-popup half-width" @click="showInfoPopup = false">
                    <div class="story-popup-content" @click.stop>
                        <div class="popup-text">
                            <div class="text-content">
                                <h3>{{ selectedProject?.content?.name }}</h3>
                                <button class="close-btn" @click="showInfoPopup = false">&times;</button>
                            </div>
                            <div v-if="selectedProject?.content?.story_text"
                                v-html="renderRichText(selectedProject?.content?.story_text)"></div>
                        </div>
                    </div>
                    <div class="story-popup-backdrop"></div>
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({ blok: Object })
const projects = ref([])
const hoveredProject = ref(null)
const selectedProject = ref(null)
const isAtBottom = ref(false)
const showInfoPopup = ref(false)
const titleElement = ref(null)
const randomPositionClass = ref('')
const storyblokApi = useStoryblokApi()
const route = useRoute()
const router = useRouter()

// Register popup close handler and page reset handler for navigation
const { registerPopupCloseHandler, registerPageResetHandler } = usePagePopups()
const unregisterPopupHandler = registerPopupCloseHandler(() => {
    showInfoPopup.value = false
})

// Register page reset handler to clear selected project and URL queries
const unregisterPageResetHandler = registerPageResetHandler('/projects', () => {
    // Reset to basic view
    selectedProject.value = null
    hoveredProject.value = null
    showInfoPopup.value = false

    // Clear URL query parameters
    router.push({ path: route.path, query: {} })

    // Reset title and scroll position
    if (titleElement.value) {
        titleElement.value.style.opacity = '1'
    }
    window.scrollTo(0, 0)
})

const selectProject = (project) => {
    // Clear hover state immediately on click
    hoveredProject.value = null
    selectedProject.value = project

    // Update URL with project slug
    router.push({
        path: route.path,
        query: { project: project.slug }
    })

    nextTick(() => {
        const anchor = document.getElementById('scroll-anchor')
        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    })
}

const handleTitleFade = () => {
    if (!titleElement.value) return

    const imagesContainer = document.querySelector('.images')
    if (!imagesContainer) return

    const images = imagesContainer.querySelectorAll('img')
    if (images.length === 0) return

    const viewportHeight = window.innerHeight
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Calculate how many images are in view
    let visibleImages = 0
    let totalImageHeight = 0

    images.forEach(img => {
        const rect = img.getBoundingClientRect()
        const imageTop = rect.top + scrollTop
        const imageBottom = imageTop + rect.height

        totalImageHeight += rect.height

        // Check if image is in viewport
        if (rect.top < viewportHeight && rect.bottom > 0) {
            visibleImages++
        }
    })

    // Calculate opacity based on scroll progress through images
    const imagesRect = imagesContainer.getBoundingClientRect()
    const imagesStart = imagesRect.top + scrollTop
    const imagesEnd = imagesStart + imagesRect.height
    const viewportBottom = scrollTop + viewportHeight

    let opacity = 0
    if (viewportBottom > imagesStart) {
        const progressThroughImages = Math.min(1, (viewportBottom - imagesStart) / imagesRect.height)
        // Fade in over first 20% of scroll through images (5x faster)
        opacity = Math.min(1, progressThroughImages * 5)
    }

    titleElement.value.style.opacity = opacity
}

const handleScroll = () => {
    // Handle title fade effect
    handleTitleFade()

    // Don't trigger if we're already at bottom, no project is selected, or popup is open
    if (isAtBottom.value || !selectedProject.value || showInfoPopup.value) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    // Check if we're near the bottom (within 10px)
    const nearBottom = scrollTop + windowHeight >= documentHeight - 10

    if (nearBottom) {
        isAtBottom.value = true
        // Auto scroll to top after a brief delay
        setTimeout(() => {
            resetView()
        }, 100)
    }
}

const resetView = () => {
    // Don't reset if popup is open
    if (showInfoPopup.value) {
        return
    }

    isAtBottom.value = false
    selectedProject.value = null
    hoveredProject.value = null
    showInfoPopup.value = false
    randomPositionClass.value = '' // Also clear the random position class

    // Reset title opacity
    if (titleElement.value) {
        titleElement.value.style.opacity = 0
    }

    // Clear URL parameters
    router.push({
        path: route.path,
        query: {}
    })

    nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    })
}

const toggleInfoPopup = () => {
    console.log('Info button clicked, current state:', showInfoPopup.value)
    showInfoPopup.value = !showInfoPopup.value
    console.log('New state:', showInfoPopup.value)
}

const renderRichText = (richTextObj) => {
    if (!richTextObj || !richTextObj.content) return ''

    return richTextObj.content.map(node => {
        if (node.type === 'paragraph') {
            const content = node.content?.map(textNode => {
                if (textNode.type === 'text') {
                    return textNode.text
                } else if (textNode.type === 'hard_break') {
                    return '<br>'
                }
                return ''
            }).join('') || ''
            return `<p>${content}</p>`
        }
        return ''
    }).join('')
}

onMounted(async () => {
    const { data } = await storyblokApi.get('cdn/stories', {
        filter_query: { component: { in: 'SingleProject' } },
        per_page: 100
    })
    projects.value = (data.stories || []).sort((a, b) => a.name.localeCompare(b.name))

    // Check for project parameter in URL and auto-select
    if (route.query.project && projects.value.length > 0) {
        const projectToSelect = projects.value.find(project => project.slug === route.query.project)
        if (projectToSelect) {
            selectedProject.value = projectToSelect
            nextTick(() => {
                const anchor = document.getElementById('scroll-anchor')
                if (anchor) {
                    anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            })
        }
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    // Clean up popup handler
    if (unregisterPopupHandler) {
        unregisterPopupHandler()
    }
    // Clean up page reset handler
    if (unregisterPageResetHandler) {
        unregisterPageResetHandler()
    }
})
</script>
