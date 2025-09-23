const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function checkImageGridGroupSchema() {
  try {
    console.log('🔍 Checking ImageGridGroup component schema...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    const imageGridGroupComponent = allComponents.find(comp => comp.name === 'ImageGridGroup')
    if (imageGridGroupComponent) {
      console.log('📋 Current ImageGridGroup schema:')
      console.log(JSON.stringify(imageGridGroupComponent.schema, null, 2))
    } else {
      console.log('❌ ImageGridGroup component not found')
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.response?.data || error.message)
  }
}

checkImageGridGroupSchema()