// Body class management composable
// Adds page-specific classes and device detection classes to document.body

export const useBodyClasses = () => {
    const route = useRoute()

    // Device detection
    const getDeviceClasses = () => {
        if (!process.client) return []

        const classes = []
        const userAgent = navigator.userAgent.toLowerCase()
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

        // Device type detection
        if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
            classes.push('mobile-device')

            if (/ipad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
                classes.push('tablet-device', 'ios-device')
            } else if (/iphone|ipod/i.test(userAgent)) {
                classes.push('phone-device', 'ios-device')
            } else if (/android/i.test(userAgent)) {
                classes.push('android-device')
                if (/mobile/i.test(userAgent)) {
                    classes.push('phone-device')
                } else {
                    classes.push('tablet-device')
                }
            }
        } else {
            classes.push('desktop-device')
        }

        // Touch capability
        if (isTouchDevice) {
            classes.push('touch-device')
        } else {
            classes.push('no-touch-device')
        }

        // Browser detection
        if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
            classes.push('chrome-browser')
        } else if (/firefox/i.test(userAgent)) {
            classes.push('firefox-browser')
        } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
            classes.push('safari-browser')
        } else if (/edge/i.test(userAgent)) {
            classes.push('edge-browser')
        }

        // Screen size classes (responsive)
        const updateScreenClasses = () => {
            // Remove existing screen classes
            document.body.classList.remove('screen-xs', 'screen-sm', 'screen-md', 'screen-lg', 'screen-xl', 'screen-xxl')

            const width = window.innerWidth
            if (width < 640) {
                document.body.classList.add('screen-xs')
            } else if (width < 768) {
                document.body.classList.add('screen-sm')
            } else if (width < 1024) {
                document.body.classList.add('screen-md')
            } else if (width < 1280) {
                document.body.classList.add('screen-lg')
            } else if (width < 1536) {
                document.body.classList.add('screen-xl')
            } else {
                document.body.classList.add('screen-xxl')
            }
        }

        // Initial screen size
        updateScreenClasses()

        // Listen for resize events
        window.addEventListener('resize', updateScreenClasses)

        return classes
    }

    // Page name class generation
    const getPageClass = (routePath) => {
        // Remove leading slash and replace slashes with dashes
        let pageName = routePath.replace(/^\//, '').replace(/\//g, '-')

        // Handle special cases
        if (!pageName || pageName === '') {
            pageName = 'home'
        }

        // Convert to kebab-case and add page- prefix
        return `page-${pageName}`
    }

    // Apply all body classes
    const applyBodyClasses = () => {
        if (!process.client) return

        // Clear previous page classes (keep other classes like mobile-menu-open)
        const existingClasses = Array.from(document.body.classList)
        existingClasses.forEach(className => {
            if (className.startsWith('page-') ||
                className.includes('device') ||
                className.includes('browser') ||
                className.includes('touch') ||
                className.startsWith('screen-')) {
                document.body.classList.remove(className)
            }
        })

        // Add page class
        const pageClass = getPageClass(route.path)
        document.body.classList.add(pageClass)

        // Add device classes
        const deviceClasses = getDeviceClasses()
        deviceClasses.forEach(className => {
            document.body.classList.add(className)
        })

        if (process.dev) {
            console.log('🏷️ Body classes applied:', {
                page: pageClass,
                device: deviceClasses,
                route: route.path
            })
        }
    }

    // Remove body classes on cleanup
    const removeBodyClasses = () => {
        if (!process.client) return

        const classesToRemove = Array.from(document.body.classList).filter(className =>
            className.startsWith('page-') ||
            className.includes('device') ||
            className.includes('browser') ||
            className.includes('touch') ||
            className.startsWith('screen-')
        )

        classesToRemove.forEach(className => {
            document.body.classList.remove(className)
        })
    }

    return {
        applyBodyClasses,
        removeBodyClasses,
        getPageClass,
        getDeviceClasses
    }
}