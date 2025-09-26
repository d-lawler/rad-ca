export default defineNuxtPlugin(() => {
    // Early body class application for immediate device detection

    if (!process.client) return

    // Apply basic device classes as early as possible
    const applyEarlyClasses = () => {
        const userAgent = navigator.userAgent.toLowerCase()

        // Basic device detection
        if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
            document.body.classList.add('mobile-device')

            if (/ipad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
                document.body.classList.add('tablet-device', 'ios-device')
            } else if (/iphone|ipod/i.test(userAgent)) {
                document.body.classList.add('phone-device', 'ios-device')
            } else if (/android/i.test(userAgent)) {
                document.body.classList.add('android-device')
            }
        } else {
            document.body.classList.add('desktop-device')
        }

        // Touch detection
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
        if (isTouchDevice) {
            document.body.classList.add('touch-device')
        } else {
            document.body.classList.add('no-touch-device')
        }

        // Initial screen size
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

    // Apply classes immediately
    applyEarlyClasses()

    if (process.dev) {
        console.log('🏷️ Body classes plugin loaded - Early device detection applied')
    }
})