export const useGridLayout = () => {
    // Global state for grid layout mode
    const gridMode = useState('grid-layout-mode', () => 'scattered')
    const isTransitioning = useState('grid-transition', () => false)

    // Setup inview animations for grid images
    const setupInviewAnimations = () => {
        if (!process.client) return

        try {
            // Clear any existing observer
            if (window.gridObserver) {
                window.gridObserver.disconnect()
            }

            // Only setup if we have grid images
            const images = document.querySelectorAll('.grid-image')
            if (images.length === 0) return

            // Create new observer
            window.gridObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1'
                        entry.target.style.filter = 'blur(0rem)'
                    }
                })
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            })

            // Observe all grid images
            images.forEach(img => {
                // Set initial state
                img.style.opacity = '0'
                img.style.filter = 'blur(2rem)'
                img.style.transition = 'opacity 0.8s ease, filter 0.8s ease'

                window.gridObserver.observe(img)
            })
        } catch (error) {
            console.warn('Grid animation setup failed:', error)
        }
    }

    // Switch grid mode with fade transition
    const switchGridMode = async (newMode) => {
        if (gridMode.value === newMode || isTransitioning.value) return

        console.log('Switching grid mode from', gridMode.value, 'to', newMode)

        // Start transition
        isTransitioning.value = true

        // Wait a bit for the fade out animation
        await new Promise(resolve => setTimeout(resolve, 300))

        // Change the mode
        gridMode.value = newMode

        // Wait a bit more for the fade in animation
        await new Promise(resolve => setTimeout(resolve, 300))

        // Re-setup inview animations for the new layout
        setupInviewAnimations()

        // End transition
        isTransitioning.value = false
    }

    const setScattered = () => switchGridMode('scattered')
    const setArranged = () => switchGridMode('arranged')

    // Initialize inview animations on first load
    const initializeAnimations = () => {
        if (!process.client) return

        try {
            setTimeout(() => {
                setupInviewAnimations()
            }, 100)
        } catch (error) {
            console.warn('Grid animation initialization failed:', error)
        }
    }

    return {
        gridMode: readonly(gridMode),
        isTransitioning: readonly(isTransitioning),
        switchGridMode,
        setScattered,
        setArranged,
        setupInviewAnimations,
        initializeAnimations
    }
}