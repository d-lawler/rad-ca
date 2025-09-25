<template>
    <Transition name="blur-fade">
        <div v-if="cartOpen" class="story-popup half-width" @click="closeCart">
            <div class="story-popup-content" @click.stop>
                <div class="popup-text">
                    <div class="text-content">
                        <h3>Cart</h3>
                        <button class="close-btn" @click="closeCart">&times;</button>
                    </div>

                    <div v-if="cartItems.length" class="cart-items">
                        <div v-for="item in cartItems" :key="item.id" class="cart-item">
                            <div class="cart-item-details">
                                <div class="cart-item-title">{{ item.productTitle }}</div>
                                <div class="cart-item-variant" v-if="item.variantTitle !== 'Default Title'">
                                    {{ item.variantTitle }}
                                </div>
                                <div class="cart-item-price">${{ item.price.toFixed(2) }}</div>
                            </div>
                            <button @click="removeFromCart(item.id)" class="remove-btn">Remove</button>
                        </div>
                        <div class="cart-total">
                            Total: ${{ cartTotal.toFixed(2) }}
                            <button @click="handleCheckout" class="checkout-btn">Checkout &rarr;</button>
                        </div>
                    </div>

                    <div v-else class="cart-empty">
                        Cart is empty
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
const { cartItems, cartOpen, cartTotal, removeFromCart, closeCart, createCheckout } = useCart()

const config = useRuntimeConfig()
const shopifyDomain = config.public.shopifyDomain
const shopifyToken = config.public.shopifyStorefrontToken

const handleCheckout = async () => {
    const checkoutUrl = await createCheckout(shopifyDomain, shopifyToken)
    if (checkoutUrl) {
        window.open(checkoutUrl, '_blank')
    } else {
        alert('Error creating checkout. Please check console for details.')
    }
}
</script>
