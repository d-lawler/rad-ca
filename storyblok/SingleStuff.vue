<template>
    <div v-editable="blok">
        <div class="ca-exhibitions-title" ref="titleElement">
            <h1 @click="scrollToGrid">Stuff</h1>
        </div>
        <div class="container additional-padding">
            <div v-if="products.length" class="products-grid show-grid" ref="gridElement">
                <div v-for="product in products" :key="product.id" class="product-item"
                    @click="openProductPopup(product)">
                    <div class="product-image-container">
                        <img v-if="product.images.edges.length" :src="product.images.edges[0].node.url"
                            :alt="product.title" loading="lazy" />
                    </div>
                    <div class="product-info-under">
                        <div class="product-type">{{ product.productType || 'Product' }}</div>
                        <div v-if="product.variants.edges.length" class="product-price">
                            ${{ product.variants.edges[0].node.price.amount }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cart Sidebar -->
        <div v-if="cartOpen" class="cart-overlay" @click="closeCart">
            <div class="cart-sidebar" @click.stop>
                <div class="cart-header">
                    <h2>Cart</h2>
                    <button @click="closeCart">Close</button>
                </div>

                <div v-if="cartItems.length" class="cart-items">
                    <div v-for="item in cartItems" :key="item.id" class="cart-item">
                        <div class="cart-item-details">
                            <div class="cart-item-title">{{ item.productTitle }}</div>
                            <div class="cart-item-variant" v-if="item.variantTitle !== 'Default Title'">{{
                                item.variantTitle }}</div>
                        </div>
                        <div class="cart-item-price">${{ item.price.toFixed(2) }}</div>
                        <button @click="removeFromCart(item.id)" class="remove-btn">Remove</button>
                    </div>
                    <div class="cart-total">
                        Total: ${{ cartTotal.toFixed(2) }}
                    </div>
                    <button @click="handleCheckout" class="checkout-btn">Checkout</button>
                </div>

                <div v-else class="cart-empty">
                    Cart is empty
                </div>
            </div>
        </div>

        <!-- Product Popup -->
        <Transition name="popup">
            <div v-if="showProductPopup" class="story-popup popup-left popup-white tall"
                @click="showProductPopup = false">
                <div v-if="selectedProduct" class="story-popup-content" @click.stop>
                    <button class="close-btn" @click="showProductPopup = false">&times;</button>

                    <!-- Full bleed carousel (excluding first image) -->
                    <div v-if="popupImages.length" class="popup-product-carousel">
                        <div v-for="(image, index) in popupImages" :key="index" class="carousel-image"
                            :class="{ 'active': index === currentImageIndex }">
                            <img :src="image.node.url" :alt="selectedProduct.title" loading="lazy" />
                        </div>
                    </div>

                    <!-- Text content area -->
                    <div class="product-text-content">
                        <div class="product-description">{{ selectedProduct.description }}</div>
                        <div v-if="selectedProduct.variants.edges.length" class="popup-product-purchase">
                            <button @click="addToCart(selectedProduct.variants.edges[0].node, selectedProduct)"
                                class="add-to-cart-btn">
                                Add to Cart &nbsp; &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

    </div>
</template>

<script setup>
const props = defineProps({ blok: Object })

const products = ref([])
const loading = ref(true)
const titleElement = ref(null)
const gridElement = ref(null)
const showProductPopup = ref(false)
const selectedProduct = ref(null)
const currentImageIndex = ref(0)
const carouselInterval = ref(null)

// Use global cart state
const { cartItems, cartOpen, cartTotal, addToCart, removeFromCart, closeCart, createCheckout } = useCart()

// Computed property to get popup images (excluding first image)
const popupImages = computed(() => {
    if (!selectedProduct.value || !selectedProduct.value.images.edges.length) return []
    // Return all images except the first one
    return selectedProduct.value.images.edges.slice(1)
})

const config = useRuntimeConfig()
const shopifyDomain = config.public.shopifyDomain
const shopifyToken = config.public.shopifyStorefrontToken


const handleScroll = () => {
    if (!titleElement.value) return

    const scrollY = window.scrollY
    const fadeOutPoint = window.innerHeight * 0.2 // 20vh

    let opacity = 1
    if (scrollY > 0) {
        opacity = Math.max(0, 1 - (scrollY / fadeOutPoint))
    }

    titleElement.value.style.opacity = opacity

    // Make h1 clickable when visible, but not when faded out
    if (opacity > 0.1) {
        titleElement.value.querySelector('h1').style.pointerEvents = 'auto'
    } else {
        titleElement.value.querySelector('h1').style.pointerEvents = 'none'
    }
}

const scrollToGrid = () => {
    if (!gridElement.value) return

    gridElement.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    })
}

const startCarousel = () => {
    if (selectedProduct.value && popupImages.value.length > 1) {
        carouselInterval.value = setInterval(() => {
            currentImageIndex.value = (currentImageIndex.value + 1) % popupImages.value.length
        }, 2500) // Change image every 2.5 seconds
    }
}

const stopCarousel = () => {
    if (carouselInterval.value) {
        clearInterval(carouselInterval.value)
        carouselInterval.value = null
    }
}

const openProductPopup = (product) => {
    selectedProduct.value = product
    showProductPopup.value = true
    currentImageIndex.value = 0

    // Start carousel after a short delay to let the popup render
    nextTick(() => {
        startCarousel()
    })
}

// Watch for popup closing to stop carousel
watch(showProductPopup, (newValue) => {
    if (!newValue) {
        stopCarousel()
    }
})

// Checkout handling
const handleCheckout = async () => {
    const checkoutUrl = await createCheckout(shopifyDomain, shopifyToken)
    if (checkoutUrl) {
        window.open(checkoutUrl, '_blank')
    } else {
        alert('Error creating checkout. Please check console for details.')
    }
}

const fetchProducts = async () => {
    try {
        console.log('🔍 Fetching products with:', { shopifyDomain, shopifyToken })

        if (!shopifyDomain) {
            console.error('SHOPIFY_DOMAIN environment variable is missing')
            return
        }

        if (!shopifyToken) {
            console.error('SHOPIFY_STOREFRONT_TOKEN environment variable is missing')
            return
        }

        const url = `https://${shopifyDomain}/api/2023-10/graphql.json`
        console.log('🚀 Making request to:', url)

        const query = `
            query {
                products(first: 20) {
                    edges {
                        node {
                            id
                            title
                            description
                            productType
                            images(first: 10) {
                                edges {
                                    node {
                                        url
                                        altText
                                    }
                                }
                            }
                            variants(first: 5) {
                                edges {
                                    node {
                                        id
                                        title
                                        price {
                                            amount
                                        }
                                        availableForSale
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyToken
            },
            body: JSON.stringify({ query })
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('📦 API Response:', data)

        if (data.errors) {
            console.error('GraphQL errors:', data.errors)
            return
        }

        products.value = data.data.products.edges.map(edge => edge.node)
        console.log('✅ Products loaded:', products.value.length, products.value.map(p => p.title))
    } catch (error) {
        console.error('Error fetching products:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchProducts()
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>
