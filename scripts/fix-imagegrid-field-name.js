const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function fixImageGridFieldName() {
  try {
    console.log('🔄 Updating ImageGrid component to use grid_groups field name...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    const imageGridComponent = allComponents.find(comp => comp.name === 'ImageGrid')
    if (imageGridComponent) {
      console.log('📝 Updating ImageGrid component field name...')

      // Update schema to use grid_groups instead of groups to match existing data
      const updatedImageGridSchema = {
        grid_groups: {
          type: 'bloks',
          display_name: 'Image Groups',
          description: 'Groups of images for the homepage grid',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['ImageGridGroup'],
          required: false
        }
      }

      const updatedImageGrid = {
        ...imageGridComponent,
        schema: updatedImageGridSchema
      }

      await Storyblok.put(`spaces/${spaceId}/components/${imageGridComponent.id}`, {
        component: updatedImageGrid
      })
      console.log('✅ ImageGrid component updated - field name changed to grid_groups')

      console.log('\n🎉 Field name synchronization completed!')
      console.log('📋 Changes made:')
      console.log('   • ImageGrid schema: Changed from "groups" to "grid_groups"')
      console.log('   • Now matches existing JSON data structure')
      console.log('   • Component should render correctly now')
    }

  } catch (error) {
    console.error('❌ Error updating ImageGrid component:', error.response?.data || error.message)
  }
}

fixImageGridFieldName()