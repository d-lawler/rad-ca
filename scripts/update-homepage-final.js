const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function updateHomepageComponent() {
  try {
    console.log('🔄 Updating homepage component to only support image_grid...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    // Find the SingleHome component
    const homepageComponent = allComponents.find(comp => comp.name === 'SingleHome')
    if (!homepageComponent) {
      console.error('❌ Homepage component not found')
      return
    }

    console.log('📝 Updating homepage component schema...')

    // Define the updated schema - only image_grid, story_text, no content
    const updatedSchema = {
      image_grid: {
        type: 'bloks',
        display_name: 'Image Grid',
        description: 'Homepage image grid with infinite scroll',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['ImageGrid'],
        required: false
      },
      story_text: {
        type: 'richtext',
        display_name: 'Story Text',
        description: 'Rich text content for the popup story',
        required: false
      }
      // Removed content field - homepage should only support image_grid
    }

    const updatedComponent = {
      ...homepageComponent,
      schema: updatedSchema
    }

    await Storyblok.put(`spaces/${spaceId}/components/${homepageComponent.id}`, {
      component: updatedComponent
    })

    console.log('✅ Homepage component updated successfully')
    console.log('📋 Changes made:')
    console.log('   • Removed content field')
    console.log('   • Kept image_grid field with ImageGrid restriction')
    console.log('   • Kept story_text field for popup')
    console.log('   • Homepage now only supports image grid components')

  } catch (error) {
    console.error('❌ Error updating homepage component:', error.response?.data || error.message)
  }
}

updateHomepageComponent()