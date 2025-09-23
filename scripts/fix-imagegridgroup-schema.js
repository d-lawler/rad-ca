const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function fixImageGridGroupSchema() {
  try {
    console.log('🔄 Removing alignment and size from ImageGridGroup component...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    const imageGridGroupComponent = allComponents.find(comp => comp.name === 'ImageGridGroup')
    if (imageGridGroupComponent) {
      console.log('📝 Updating ImageGridGroup component (removing alignment/size)...')

      const updatedImageGridGroupSchema = {
        images: {
          type: 'asset',
          display_name: 'Images',
          description: 'Multiple images for this grid group',
          required: false,
          asset_folder_id: null,
          filetypes: ['images', 'videos'],
          multiple: true
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

      console.log('\n🎉 Homepage grid component simplification completed!')
      console.log('📋 Changes made:')
      console.log('   • ImageGrid: Alignment and size fields removed ✅')
      console.log('   • ImageGridGroup: Alignment and size fields removed ✅')
      console.log('   • Styling is now handled by CSS nth-child rules in _home.scss')
      console.log('   • Components are now simpler for content editors')
    }

  } catch (error) {
    console.error('❌ Error updating ImageGridGroup component:', error.response?.data || error.message)
  }
}

fixImageGridGroupSchema()