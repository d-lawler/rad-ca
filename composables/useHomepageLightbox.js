// Global state for the homepage lightbox - using useState for SSR compatibility
const globalLightboxState = () => useState('homepage-lightbox', () => ({
    isOpen: false,
    images: [],
    currentIndex: 0,
    groupTitle: ''
}))

export const useHomepageLightbox = () => {
    const state = globalLightboxState()

    // Open the lightbox with a set of images
    const openLightbox = (imageList, startIndex = 0, title = '') => {
        console.log('Opening lightbox with:', { imageList, startIndex, title })
        state.value.images = imageList
        state.value.currentIndex = startIndex
        state.value.groupTitle = title
        state.value.isOpen = true
    }

    // Close the lightbox
    const closeLightbox = () => {
        state.value.isOpen = false
        // Reset state after animation
        setTimeout(() => {
            state.value.images = []
            state.value.currentIndex = 0
            state.value.groupTitle = ''
        }, 300)
    }

    // Navigate to next image
    const nextImage = () => {
        if (state.value.currentIndex < state.value.images.length - 1) {
            state.value.currentIndex++
        }
    }

    // Navigate to previous image
    const prevImage = () => {
        if (state.value.currentIndex > 0) {
            state.value.currentIndex--
        }
    }

    // Go to specific image
    const goToImage = (index) => {
        if (index >= 0 && index < state.value.images.length) {
            state.value.currentIndex = index
        }
    }

    return {
        isOpen: computed(() => state.value.isOpen),
        images: computed(() => state.value.images),
        currentIndex: computed({
            get: () => state.value.currentIndex,
            set: (value) => state.value.currentIndex = value
        }),
        groupTitle: computed(() => state.value.groupTitle),
        openLightbox,
        closeLightbox,
        nextImage,
        prevImage,
        goToImage
    }
}