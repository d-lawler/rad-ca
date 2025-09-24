<template>
    <div v-editable="blok" class="projects-page">
        <!--  -->
        <Transition name="fade-blur" mode="out-in">
            <div v-if="!selectedProject || isAtBottom" class="container additional-padding content-list project-list" key="project-list">
                <a v-for="project in projects" :key="project.uuid" href="javascript:void(0)"
                    @mouseenter="hoveredProject = project" @mouseleave="hoveredProject = null"
                    @click="selectProject(project)">{{ project.name }}</a>
            </div>
        </Transition>
        <div v-if="!isAtBottom" class="container additional-padding content-list-item">
            <Transition name="fade-blur" mode="out-in" id="scroll-anchor">
                <div v-if="(hoveredProject || selectedProject)?.content?.featured_image" class="thumbnail"
                    :key="(hoveredProject || selectedProject)?.uuid">
                    <NuxtImg :src="(hoveredProject || selectedProject).content.featured_image.filename"
                        :alt="(hoveredProject || selectedProject).content.featured_image.alt" />
                </div>
            </Transition>
            <Transition name="fade-blur" mode="out-in">
                <div v-if="selectedProject" class="content"
                    :key="selectedProject?.uuid">
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
            <Transition name="fade-blur" mode="out-in">
                <div v-if="showInfoPopup"
                     class="story-popup popup-left popup-white tall"
                     @click="showInfoPopup = false">
                    <div class="story-popup-content" @click.stop>
                        <button class="close-btn" @click="showInfoPopup = false">&times;</button>
                        <div class="info-content">
                            <h2>{{ selectedProject?.content?.name }}</h2>
                            <div v-if="selectedProject?.content?.story_text"
                                 class="description">
                                <div v-html="renderRichText(selectedProject?.content?.story_text)"></div>
                            </div>
                        </div>
                    </div>
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
const storyblokApi = useStoryblokApi()
const route = useRoute()
const router = useRouter()

const selectProject = (project) => {
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
})
</script>
