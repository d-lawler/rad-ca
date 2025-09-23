<template>
    <div class="ca-wrapper" :class="wrapperClasses">
        <Header />
        <transition name="fade-blur" appear>
            <main class="main-content" v-if="hydrated">
                <slot />
            </main>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const hydrated = ref(false)
const route = useRoute()

// Reactive device detection state
const deviceClasses = ref([])

// Get page title from route name or path
const getPageTitle = () => {
    // If root path, return 'home'
    if (route.path === '/') {
        return 'home'
    }
    // If route name is 'slug' (Nuxt dynamic route), check for actual slug param
    if (route.name === 'slug') {
        const slugParam = route.params.slug
        if (!slugParam || (Array.isArray(slugParam) && slugParam.length === 0)) {
            return 'home'
        }
        if (Array.isArray(slugParam)) {
            return slugParam.join('-').toLowerCase()
        }
        return slugParam.toLowerCase()
    }
    // Otherwise, use route name or path
    if (route.name) {
        return route.name.toString().toLowerCase()
    }
    const path = route.path.slice(1).replace(/\//g, '-')
    return path.toLowerCase()
}

// Device detection classes - runs on client side
const detectDevice = () => {
    if (process.client) {
        const classes = []

        // Browser detection
        const userAgent = navigator.userAgent.toLowerCase()
        if (userAgent.includes('chrome') && !userAgent.includes('edge')) classes.push('browser-chrome')
        else if (userAgent.includes('firefox')) classes.push('browser-firefox')
        else if (userAgent.includes('safari') && !userAgent.includes('chrome')) classes.push('browser-safari')
        else if (userAgent.includes('edge')) classes.push('browser-edge')

        // Device type detection
        if (/mobile|android|iphone/i.test(userAgent)) classes.push('device-mobile')
        else if (/tablet|ipad/i.test(userAgent)) classes.push('device-tablet')
        else classes.push('device-desktop')

        // OS detection
        if (userAgent.includes('mac')) classes.push('os-mac')
        else if (userAgent.includes('windows')) classes.push('os-windows')
        else if (userAgent.includes('linux')) classes.push('os-linux')
        else if (/android/i.test(userAgent)) classes.push('os-android')
        else if (/iphone|ipad/i.test(userAgent)) classes.push('os-ios')

        // Touch capability
        if ('ontouchstart' in window) classes.push('touch-enabled')
        else classes.push('no-touch')

        deviceClasses.value = classes
    }
}

const wrapperClasses = computed(() => {
    return [
        `page-${getPageTitle()}`,
        ...deviceClasses.value
    ]
})


// Run device detection on client side and apply classes to body
onMounted(() => {
    detectDevice()
    // Mark body as hydrated to show content
    document.body.classList.add('hydrated')

    // Apply device classes to body for global styling
    wrapperClasses.value.forEach(cls => {
        document.body.classList.add(cls)
    })

    // Wait for fonts or just delay, then show content
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => setTimeout(() => { hydrated.value = true }, 200))
    } else {
        setTimeout(() => { hydrated.value = true }, 700)
    }
})

// Watch for route changes to update page classes on body
watch(() => route.path, () => {
    if (process.client) {
        // Remove all page-* classes from body
        Array.from(document.body.classList)
            .filter(cls => cls.startsWith('page-'))
            .forEach(cls => document.body.classList.remove(cls))
        // Add new page class to body
        document.body.classList.add(`page-${getPageTitle()}`)
    }
})
</script>