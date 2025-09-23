const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function checkImageGridSchema() {
  try {
    console.log('🔍 Checking ImageGrid component schema...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    const imageGridComponent = allComponents.find(comp => comp.name === 'ImageGrid')
    if (imageGridComponent) {
      console.log('📋 Current ImageGrid schema:')
      console.log(JSON.stringify(imageGridComponent.schema, null, 2))
    } else {
      console.log('❌ ImageGrid component not found')
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.response?.data || error.message)
  }
}

checkImageGridSchema()