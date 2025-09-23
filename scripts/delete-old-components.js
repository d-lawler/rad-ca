const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function deleteOldComponents() {
  try {
    console.log('🗑️ Deleting old Storyblok components...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    // Components to delete (old ones we replaced)
    const componentsToDelete = [
      'Content',
      'AssetGroup'
    ]

    for (const componentName of componentsToDelete) {
      const component = allComponents.find(comp => comp.name === componentName)
      if (component) {
        try {
          console.log(`🗑️ Deleting ${componentName} component...`)
          await Storyblok.delete(`spaces/${spaceId}/components/${component.id}`)
          console.log(`✅ Successfully deleted ${componentName}`)
        } catch (error) {
          if (error.response?.status === 422) {
            console.log(`⚠️ Cannot delete ${componentName} - it's still being used in stories`)
            console.log(`   You'll need to update existing stories first`)
          } else {
            console.error(`❌ Error deleting ${componentName}:`, error.response?.data || error.message)
          }
        }
      } else {
        console.log(`ℹ️ Component ${componentName} not found (already deleted?)`)
      }
    }

    // Also clean up some potentially unused components
    const potentiallyUnusedComponents = [
      'Asset',  // If this was an old individual asset component
      'Assets'  // If this was an old assets component
    ]

    console.log('\n🔍 Checking potentially unused components...')
    for (const componentName of potentiallyUnusedComponents) {
      const component = allComponents.find(comp => comp.name === componentName)
      if (component) {
        console.log(`   Found ${componentName} - check if this is still needed`)
      }
    }

    console.log('\n✅ Old component deletion completed!')

  } catch (error) {
    console.error('❌ Error during deletion:', error.response?.data || error.message)
  }
}

deleteOldComponents()