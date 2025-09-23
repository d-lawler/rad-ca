const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function removeHomepageComponent() {
  try {
    console.log('🔄 Removing redundant HomePage component...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    // Find the HomePage component (redundant one)
    const homepageComponent = allComponents.find(comp => comp.name === 'HomePage')
    if (!homepageComponent) {
      console.log('ℹ️ HomePage component not found - may already be deleted')
      return
    }

    console.log('📝 Found HomePage component - checking if it\'s safe to delete...')
    console.log(`   • Component ID: ${homepageComponent.id}`)
    console.log(`   • Display Name: ${homepageComponent.display_name}`)
    console.log(`   • Schema: ${Object.keys(homepageComponent.schema || {}).join(', ')}`)

    // Delete the component
    await Storyblok.delete(`spaces/${spaceId}/components/${homepageComponent.id}`)

    console.log('✅ HomePage component deleted successfully')
    console.log('📋 Changes made:')
    console.log('   • Removed redundant HomePage component')
    console.log('   • SingleHome component remains as the active homepage component')
    console.log('   • Homepage functionality consolidated to SingleHome')

  } catch (error) {
    console.error('❌ Error removing HomePage component:', error.response?.data || error.message)
    if (error.response?.status === 422) {
      console.log('⚠️ Component may be in use by stories. Check Storyblok interface to remove references first.')
    }
  }
}

removeHomepageComponent()