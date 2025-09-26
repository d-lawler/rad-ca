// Global state management for page popups and page resets
// This composable allows components to register popup close handlers
// and page reset handlers for clean navigation

const popupCloseHandlers = ref(new Set())
const pageResetHandlers = ref(new Map()) // Map of route -> reset handler

export const usePagePopups = () => {
    // Register a popup close handler
    const registerPopupCloseHandler = (handler) => {
        popupCloseHandlers.value.add(handler)

        // Return unregister function for cleanup
        return () => {
            popupCloseHandlers.value.delete(handler)
        }
    }

    // Register a page reset handler for a specific route
    const registerPageResetHandler = (routePath, handler) => {
        pageResetHandlers.value.set(routePath, handler)

        // Return unregister function for cleanup
        return () => {
            pageResetHandlers.value.delete(routePath)
        }
    }

    // Close all registered popups
    const closeAllPopups = () => {
        popupCloseHandlers.value.forEach(handler => {
            if (typeof handler === 'function') {
                handler()
            }
        })
    }

    // Reset specific page to basic view
    const resetPageToBasicView = (routePath) => {
        const handler = pageResetHandlers.value.get(routePath)
        if (typeof handler === 'function') {
            handler()
        }
    }

    // Debug logging
    const getActivePopupCount = () => {
        return popupCloseHandlers.value.size
    }

    if (process.dev) {
        console.log('🔧 usePagePopups composable loaded')
    }

    return {
        registerPopupCloseHandler,
        registerPageResetHandler,
        closeAllPopups,
        resetPageToBasicView,
        getActivePopupCount
    }
}