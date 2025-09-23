<template>
    <div v-editable="blok" class="books-page">
        <!--  -->
        <Transition name="fade-blur" mode="out-in">
            <div v-if="!selectedBook || isAtBottom" class="container additional-padding content-list book-list" key="book-list">
                <a v-for="book in books" :key="book.uuid" href="javascript:void(0)" @mouseenter="hoveredBook = book"
                    @mouseleave="hoveredBook = null" @click="selectBook(book)" class="book-link">{{ book.name }}</a>
            </div>
        </Transition>
        <!--  -->
        <div v-if="!isAtBottom" class="container additional-padding content-list-item">
            <Transition name="fade-blur" mode="out-in" id="scroll-anchor">
                <div v-if="(hoveredBook || selectedBook)?.content?.featured_image" class="thumbnail"
                    :key="(hoveredBook || selectedBook)?.uuid">
                    <NuxtImg :src="(hoveredBook || selectedBook).content.featured_image.filename"
                        :alt="(hoveredBook || selectedBook).content.featured_image.alt" />
                </div>
            </Transition>
            <Transition name="fade-blur" mode="out-in">
                <div v-if="hoveredBook || selectedBook" class="content" :key="(hoveredBook || selectedBook)?.uuid">
                    <div class="title">
                        <h1 @click="toggleInfoPopup" style="cursor: pointer;">
                            {{ (hoveredBook || selectedBook)?.content?.name }} 
                            <button class="info-button"
                                @click="toggleInfoPopup">
                                (I<span class="mobile">NFO</span>)
                            </button>
                        </h1>
                    </div>
                    <div class="images">
                        <div v-for="block in (hoveredBook || selectedBook)?.content?.content" :key="block._uid">
                            <StoryblokComponent :blok="block" />
                        </div>
                    </div>
                </div>
            </Transition>
            <!--  -->
            <Transition name="fade-blur" mode="out-in">
                <div v-if="showInfoPopup" class="story-popup popup-left popup-white tall"
                    @click="showInfoPopup = false">
                    <div class="story-popup-content" @click.stop>
                        <button class="close-btn" @click="showInfoPopup = false">&times;</button>
                        <div class="info-content">
                            <div v-if="(hoveredBook || selectedBook)?.content?.story_text" class="description">
                                <div v-html="renderRichText((hoveredBook || selectedBook)?.content?.story_text)"></div>
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
const books = ref([])
const hoveredBook = ref(null)
const selectedBook = ref(null)
const isAtBottom = ref(false)
const showInfoPopup = ref(false)
const storyblokApi = useStoryblokApi()
const route = useRoute()
const router = useRouter()

const selectBook = (book) => {
    selectedBook.value = book

    // Update URL with book slug
    router.push({
        path: route.path,
        query: { book: book.slug }
    })

    nextTick(() => {
        const anchor = document.getElementById('scroll-anchor')
        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    })
}

const handleScroll = () => {
    // Don't trigger if we're already at bottom, no book is selected, or popup is open
    if (isAtBottom.value || !selectedBook.value || showInfoPopup.value) return

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
    selectedBook.value = null
    hoveredBook.value = null
    showInfoPopup.value = false

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
        filter_query: { component: { in: 'SingleBook' } },
        per_page: 100
    })
    books.value = (data.stories || []).sort((a, b) => a.name.localeCompare(b.name))

    // Check for book parameter in URL and auto-select
    if (route.query.book && books.value.length > 0) {
        const bookToSelect = books.value.find(book => book.slug === route.query.book)
        if (bookToSelect) {
            selectedBook.value = bookToSelect
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
