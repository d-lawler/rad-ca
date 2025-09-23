<template>
    <div v-if="isDesktop" ref="cursor" class="custom-cursor" :class="{ 'hover': isHovering, 'visible': isVisible }" />
</template>

<script setup>
const cursor = ref(null)
const isHovering = ref(false)
const isVisible = ref(false)
const isDesktop = ref(false)

// Check if device is desktop
const checkDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /mobile|android|iphone/i.test(userAgent)
    const isTablet = /tablet|ipad/i.test(userAgent)
    const hasTouch = 'ontouchstart' in window
    const isSmallScreen = window.innerWidth <= 1024

    isDesktop.value = !isMobile && !isTablet && !hasTouch && !isSmallScreen
}

// Store cleanup functions
let cleanup = null

onMounted(() => {
    checkDevice()

    if (!isDesktop.value) return

    nextTick(() => {
        const cursorElement = cursor.value
        if (!cursorElement) return

        // Hide default cursor
        document.body.style.cursor = 'none'

        // Mouse movement
        const handleMouseMove = (e) => {
            if (cursorElement) {
                cursorElement.style.left = e.clientX + 'px'
                cursorElement.style.top = e.clientY + 'px'
                isVisible.value = true
            }
        }

        // Hide cursor when mouse leaves the viewport
        const handleMouseLeave = (e) => {
            // Check if mouse actually left the viewport
            if (e.clientY <= 0 || e.clientX <= 0 ||
                e.clientX >= window.innerWidth ||
                e.clientY >= window.innerHeight) {
                isVisible.value = false
            }
        }

        // Show cursor when mouse enters the viewport
        const handleMouseEnter = () => {
            isVisible.value = true
        }

        // Hover state using event delegation
        const handleMouseOver = (e) => {
            const target = e.target
            if (target.matches('a, button, [role="button"], input, textarea, select, h1[onclick], h1[role="button"], .ca-wordmark h1, .ca-exhibitions-title h1')) {
                isHovering.value = true
            }
        }

        const handleMouseOut = (e) => {
            const target = e.target
            if (target.matches('a, button, [role="button"], input, textarea, select, h1[onclick], h1[role="button"], .ca-wordmark h1, .ca-exhibitions-title h1')) {
                isHovering.value = false
            }
        }

        // Add listeners using event delegation
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseover', handleMouseOver)
        document.addEventListener('mouseout', handleMouseOut)
        document.documentElement.addEventListener('mouseleave', handleMouseLeave)
        document.documentElement.addEventListener('mouseenter', handleMouseEnter)

        // Center cursor on load
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2
        cursorElement.style.left = centerX + 'px'
        cursorElement.style.top = centerY + 'px'

        // Store cleanup function
        cleanup = () => {
            document.body.style.cursor = 'auto'
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseover', handleMouseOver)
            document.removeEventListener('mouseout', handleMouseOut)
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
            document.documentElement.removeEventListener('mouseenter', handleMouseEnter)
        }
    })
})

// Register cleanup outside of async context
onUnmounted(() => {
    if (cleanup) {
        cleanup()
    }
})
</script>