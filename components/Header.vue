<template>
    <header class="Header" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
        <nav class="container mx-auto flex items-center justify-between py-4">

            <!-- Desktop CA logo + Mobile header -->
            <div class="flex items-center space-x-4 nav">
                <NuxtLink to="/" class="ca">CA</NuxtLink>
                <!-- Mobile hamburger - only visible on mobile -->
                <button @click="toggleMobileMenu" class="hamburger-menu">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </div>

            <!-- Desktop navigation - hidden on mobile -->
            <div class="flex items-center justify-center space-x-4 nav link-group">
                <NuxtLink to="/books">Books</NuxtLink>
                <NuxtLink to="/projects">Index</NuxtLink>
                <NuxtLink to="/stuff">Stuff</NuxtLink>
                <ClientOnly>
                    <button v-if="cartCount > 0" @click="toggleCart" class="cart-link">
                        Cart: {{ cartCount }}
                    </button>
                </ClientOnly>
            </div>
            <div class="flex items-center justify-end space-x-4 nav">
                <NuxtLink to="/about">About</NuxtLink>
            </div>

            <!-- Mobile navigation content - appears when menu is open -->
            <div class="mobile-nav-content">
                <div class="link-group">
                    <NuxtLink to="/books" @click="closeMobileMenu">Books</NuxtLink>
                    <NuxtLink to="/projects" @click="closeMobileMenu">Index</NuxtLink>
                    <NuxtLink to="/exhibitions" @click="closeMobileMenu">Shows</NuxtLink>
                    <NuxtLink to="/stuff" @click="closeMobileMenu">Stuff</NuxtLink>
                    <ClientOnly>
                        <button v-if="cartCount > 0" @click="toggleCart; closeMobileMenu()" class="cart-link">
                            Cart: {{ cartCount }}
                        </button>
                    </ClientOnly>
                </div>
                <div class="nav">
                    <NuxtLink to="/about" @click="closeMobileMenu">About</NuxtLink>
                </div>
            </div>

        </nav>
    </header>
</template>

<script setup>
const { cartCount, toggleCart } = useCart()

// Mobile menu state
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
}

// Close mobile menu on route change
const router = useRouter()
router.afterEach(() => {
    closeMobileMenu()
})
</script>