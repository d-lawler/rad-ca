const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function removeHomepageGridOptions() {
  try {
    console.log('🔄 Removing alignment and size options from homepage grid components...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    // 1. Update ImageGrid component
    const imageGridComponent = allComponents.find(comp => comp.name === 'ImageGrid')
    if (imageGridComponent) {
      console.log('📝 Updating ImageGrid component (removing alignment/size)...')

      const updatedImageGridSchema = {
        groups: {
          type: 'bloks',
          display_name: 'Image Groups',
          description: 'Groups of images for the homepage grid',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['ImageGridGroup'],
          required: false
        }
        // Removed alignment and size fields - handled by CSS nth-child styles
      }

      const updatedImageGrid = {
        ...imageGridComponent,
        schema: updatedImageGridSchema
      }

      await Storyblok.put(`spaces/${spaceId}/components/${imageGridComponent.id}`, {
        component: updatedImageGrid
      })
      console.log('✅ ImageGrid component updated - alignment/size fields removed')
    }

    // 2. Update ImageGridGroup component
    const imageGridGroupComponent = allComponents.find(comp => comp.name === 'ImageGridGroup')
    if (imageGridGroupComponent) {
      console.log('📝 Updating ImageGridGroup component (removing alignment/size)...')

      const updatedImageGridGroupSchema = {
        images: {
          type: 'assets',
          display_name: 'Images',
          description: 'Images for this group',
          required: false,
          asset_folder_id: null,
          filetypes: ['images', 'videos']
        }
        // Removed alignment and size fields - handled by CSS nth-child styles
      }

      const updatedImageGridGroup = {
        ...imageGridGroupComponent,
        schema: updatedImageGridGroupSchema
      }

      await Storyblok.put(`spaces/${spaceId}/components/${imageGridGroupComponent.id}`, {
        component: updatedImageGridGroup
      })
      console.log('✅ ImageGridGroup component updated - alignment/size fields removed')
    }

    console.log('\n🎉 Homepage grid component simplification completed!')
    console.log('📋 Changes made:')
    console.log('   • ImageGrid: Removed alignment and size fields')
    console.log('   • ImageGridGroup: Removed alignment and size fields')
    console.log('   • Styling is now handled by CSS nth-child rules in _home.scss')
    console.log('   • Components are now simpler for content editors')

  } catch (error) {
    console.error('❌ Error updating homepage grid components:', error.response?.data || error.message)
  }
}

removeHomepageGridOptions()