const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function listComponents() {
  try {
    console.log('🔍 Listing all components...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    console.log('📋 Available components:')
    allComponents.forEach(comp => {
      console.log(`   • ${comp.name} (${comp.display_name || 'No display name'})`)
    })

    // Look specifically for homepage-related components
    const homepageComponents = allComponents.filter(comp =>
      comp.name.toLowerCase().includes('home') ||
      comp.display_name?.toLowerCase().includes('home')
    )

    if (homepageComponents.length > 0) {
      console.log('\n🏠 Homepage-related components:')
      homepageComponents.forEach(comp => {
        console.log(`   • ${comp.name} - ${comp.display_name || 'No display name'}`)
        console.log(`     Schema keys: ${Object.keys(comp.schema || {}).join(', ')}`)
      })
    }

  } catch (error) {
    console.error('❌ Error listing components:', error.response?.data || error.message)
  }
}

listComponents()