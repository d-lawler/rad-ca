export const useCart = () => {
  // Global cart state
  const cartItems = useState('cart.items', () => [])
  const cartOpen = useState('cart.open', () => false)

  // Computed values
  const cartCount = computed(() => {
    return cartItems.value.reduce((count, item) => count + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  // Cart actions
  const addToCart = (variant, product) => {
    cartItems.value.push({
      id: `${variant.id}-${Date.now()}`, // Unique ID for each cart item
      variantId: variant.id,
      productTitle: product.title,
      variantTitle: variant.title,
      price: parseFloat(variant.price.amount),
      quantity: 1
    })
  }

  const removeFromCart = (variantId) => {
    const index = cartItems.value.findIndex(item => item.id === variantId)
    if (index !== -1) {
      cartItems.value.splice(index, 1)
    }
  }

  const toggleCart = () => {
    cartOpen.value = !cartOpen.value
  }

  const openCart = () => {
    cartOpen.value = true
  }

  const closeCart = () => {
    cartOpen.value = false
  }

  const createCheckout = async (shopifyDomain, shopifyToken) => {
    if (!cartItems.value.length) return null

    try {
      const lineItems = cartItems.value.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }))

      console.log('Creating checkout with line items:', lineItems)

      const mutation = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      const variables = {
        input: {
          lines: lineItems.map(item => ({
            merchandiseId: item.variantId,
            quantity: item.quantity
          }))
        }
      }

      const response = await fetch(`https://${shopifyDomain}/api/2023-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': shopifyToken
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables
        })
      })

      const data = await response.json()
      console.log('Shopify checkout response:', data)

      if (data.data?.cartCreate?.cart?.checkoutUrl) {
        console.log('Checkout URL created:', data.data.cartCreate.cart.checkoutUrl)
        return data.data.cartCreate.cart.checkoutUrl
      } else {
        console.error('Checkout creation failed:', data.data?.cartCreate?.userErrors || data.errors)
        console.error('Full response:', JSON.stringify(data, null, 2))
        return null
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      return null
    }
  }

  return {
    cartItems: readonly(cartItems),
    cartOpen: readonly(cartOpen),
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    toggleCart,
    openCart,
    closeCart,
    createCheckout
  }
}