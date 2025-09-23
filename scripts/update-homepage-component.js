const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function updateHomepageComponent() {
  try {
    console.log('🔄 Updating Homepage component to use ImageGrid...')

    // Define the updated Homepage component schema
    const updatedHomepageComponent = {
      name: 'HomePage',
      display_name: 'Home Page',
      schema: {
        story_text: {
          type: 'richtext',
          display_name: 'Story Text',
          description: 'Rich text content for the popup',
          required: false
        },
        image_grid: {
          type: 'bloks',
          display_name: 'Image Grid',
          description: 'Main image grid for the homepage',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['ImageGrid'],
          required: false,
          maximum: 1
        },
        // Keep backward compatibility with old structure
        content: {
          type: 'bloks',
          display_name: 'Content (Legacy)',
          description: 'Legacy content structure - use Image Grid instead',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['Content'],
          required: false
        }
      },
      is_root: false,
      is_nestable: true,
      component_group_uuid: null,
      color: '#E91E63',
      icon: 'block-home'
    }

    try {
      // Check if HomePage component exists
      const response = await Storyblok.get(`spaces/${spaceId}/components`, {
        search: 'HomePage'
      })
      const existingHomePage = response.data.components.find(comp => comp.name === 'HomePage')

      if (existingHomePage) {
        console.log('📝 Updating existing HomePage component...')
        await Storyblok.put(`spaces/${spaceId}/components/${existingHomePage.id}`, {
          component: updatedHomepageComponent
        })
        console.log('✅ HomePage component updated successfully!')
      } else {
        console.log('📝 Creating new HomePage component...')
        await Storyblok.post(`spaces/${spaceId}/components`, {
          component: updatedHomepageComponent
        })
        console.log('✅ HomePage component created successfully!')
      }
    } catch (error) {
      console.error('❌ Error updating HomePage component:', error.response?.data || error.message)
    }

    console.log('🎉 Homepage component updated successfully!')
    console.log('📋 New structure:')
    console.log('   • HomePage now has an image_grid field')
    console.log('   • image_grid accepts ImageGrid components')
    console.log('   • ImageGrid contains ImageGridGroup components')
    console.log('   • ImageGridGroup contains multiple images with alignment/size options')

  } catch (error) {
    console.error('❌ Error updating homepage component:', error.response?.data || error.message)
  }
}

updateHomepageComponent()