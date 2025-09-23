const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function simplifyComponents() {
  try {
    console.log('🔄 Simplifying ImageRow and ImageItem components...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    // 1. Update ImageRow to remove spacing
    const imageRowComponent = allComponents.find(comp => comp.name === 'ImageRow')
    if (imageRowComponent) {
      console.log('📝 Updating ImageRow component (removing spacing)...')

      const updatedImageRowSchema = {
        alignment: {
          type: 'option',
          display_name: 'Row Alignment',
          description: 'How to align images in this row',
          default_value: 'center',
          options: [
            {
              name: 'Left',
              value: 'left'
            },
            {
              name: 'Center',
              value: 'center'
            },
            {
              name: 'Right',
              value: 'right'
            }
          ],
          required: false
        },
        images: {
          type: 'bloks',
          display_name: 'Images',
          description: 'Add multiple images to this row with individual sizing',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['ImageItem'],
          required: false
        }
        // Removed spacing field
      }

      const updatedImageRow = {
        ...imageRowComponent,
        schema: updatedImageRowSchema
      }

      await Storyblok.put(`spaces/${spaceId}/components/${imageRowComponent.id}`, {
        component: updatedImageRow
      })
      console.log('✅ ImageRow component updated - spacing field removed')
    }

    // 2. Update ImageItem to remove alt_text
    const imageItemComponent = allComponents.find(comp => comp.name === 'ImageItem')
    if (imageItemComponent) {
      console.log('📝 Updating ImageItem component (removing alt_text)...')

      const updatedImageItemSchema = {
        image: {
          type: 'asset',
          display_name: 'Image',
          required: true,
          asset_folder_id: null,
          filetypes: ['images', 'videos']
        },
        size: {
          type: 'option',
          display_name: 'Size',
          description: 'Size of this image in the row',
          default_value: 'medium',
          options: [
            {
              name: 'Small',
              value: 'small'
            },
            {
              name: 'Medium',
              value: 'medium'
            },
            {
              name: 'Large',
              value: 'large'
            }
          ],
          required: false
        }
        // Removed alt_text field (use Storyblok's built-in alt field)
      }

      const updatedImageItem = {
        ...imageItemComponent,
        schema: updatedImageItemSchema
      }

      await Storyblok.put(`spaces/${spaceId}/components/${imageItemComponent.id}`, {
        component: updatedImageItem
      })
      console.log('✅ ImageItem component updated - alt_text field removed')
    }

    console.log('\n🎉 Component simplification completed!')
    console.log('📋 Changes made:')
    console.log('   • ImageRow: Removed spacing field (tight/normal/wide)')
    console.log('   • ImageItem: Removed alt_text field (use Storyblok built-in alt)')
    console.log('   • Components are now cleaner and less redundant')

  } catch (error) {
    console.error('❌ Error simplifying components:', error.response?.data || error.message)
  }
}

simplifyComponents()