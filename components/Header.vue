<template>
    <header class="Header" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
        <nav class="container mx-auto flex items-center justify-between py-4">

            <!-- Desktop CA logo + Mobile header -->
            <div class="flex items-center space-x-4 nav">
                <NuxtLink to="/" class="ca" @click="handleNavClick">CA</NuxtLink>
                <!-- Mobile hamburger - only visible on mobile -->
                <button @click="toggleMobileMenu" class="hamburger-menu">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </div>

            <!-- Desktop navigation - hidden on mobile -->
            <div class="flex items-center justify-center space-x-4 nav link-group">
                <NuxtLink to="/books" @click="handleBooksNavClick">Books</NuxtLink>
                <NuxtLink to="/projects" @click="handleProjectsNavClick">Index</NuxtLink>
                <NuxtLink to="/stuff" @click="handleNavClick">Stuff</NuxtLink>
            </div>
            <div class="flex items-center justify-end space-x-4 nav">
                <ClientOnly>
                    <button v-if="cartCount > 0" @click="toggleCart" class="cart-link">
                        Cart:{{ cartCount }}
                    </button>
                </ClientOnly>
                <NuxtLink to="/about" @click="handleNavClick">About</NuxtLink>
            </div>

            <!-- Mobile navigation content - appears when menu is open -->
            <div class="mobile-nav-content">
                <div class="link-group">
                    <NuxtLink to="/books" @click="handleMobileBooksNavClick">Books</NuxtLink>
                    <NuxtLink to="/projects" @click="handleMobileProjectsNavClick">Index</NuxtLink>
                    <NuxtLink to="/stuff" @click="handleMobileNavClick">Stuff</NuxtLink>
                    <ClientOnly>
                        <button v-if="cartCount > 0" @click="toggleCart" class="cart-link">
                            Cart: {{ cartCount }}
                        </button>
                    </ClientOnly>
                </div>
                <div class="nav">
                    <NuxtLink to="/about" @click="handleMobileNavClick">About</NuxtLink>
                </div>
            </div>

        </nav>
    </header>
</template>

<script setup>
const { cartCount, toggleCart } = useCart()
const { closeAllPopups, resetPageToBasicView } = usePagePopups()
const router = useRouter()
const route = useRoute()

// Mobile menu state
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
    // Add/remove body class for browsers that don't support :has()
    if (process.client) {
        if (isMobileMenuOpen.value) {
            document.body.classList.add('mobile-menu-open')
        } else {
            document.body.classList.remove('mobile-menu-open')
        }
    }
}

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
    // Remove body class
    if (process.client) {
        document.body.classList.remove('mobile-menu-open')
    }
}

// Handle navigation clicks - close any open popups
const handleNavClick = () => {
    closeAllPopups()
}

// Handle Books navigation - reset to basic view if already on books page
const handleBooksNavClick = (event) => {
    if (route.path === '/books') {
        event.preventDefault()
        resetPageToBasicView('/books')
    } else {
        closeAllPopups()
    }
}

// Handle Projects navigation - reset to basic view if already on projects page
const handleProjectsNavClick = (event) => {
    if (route.path === '/projects') {
        event.preventDefault()
        resetPageToBasicView('/projects')
    } else {
        closeAllPopups()
    }
}

// Handle mobile navigation clicks - close mobile menu AND handle page resets
const handleMobileBooksNavClick = (event) => {
    closeMobileMenu()
    if (route.path === '/books') {
        event.preventDefault()
        resetPageToBasicView('/books')
    } else {
        closeAllPopups()
    }
}

const handleMobileProjectsNavClick = (event) => {
    closeMobileMenu()
    if (route.path === '/projects') {
        event.preventDefault()
        resetPageToBasicView('/projects')
    } else {
        closeAllPopups()
    }
}

// Handle other mobile navigation clicks
const handleMobileNavClick = () => {
    closeMobileMenu()
    closeAllPopups()
}

// Close mobile menu on route change
router.afterEach(() => {
    closeMobileMenu()
})
</script>