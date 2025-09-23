const StoryblokClient = require('storyblok-js-client')

// Initialize Storyblok Management API client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_OAUTH_TOKEN,
  region: '' // Set to 'us' if your space is in US region
})

const SPACE_ID = process.env.STORYBLOK_SPACE_ID

async function updateSingleAboutContentType() {
  try {
    console.log('Updating SingleAbout content type...')

    // First, get the existing SingleAbout component
    const response = await Storyblok.get(`spaces/${SPACE_ID}/components`)
    const components = response.data.components

    const singleAboutComponent = components.find(comp => comp.name === 'SingleAbout')

    if (!singleAboutComponent) {
      console.error('SingleAbout component not found!')
      return
    }

    console.log('Found SingleAbout component, updating schema...')

    // Add the exhibition_lists field to the existing schema
    const updatedSchema = {
      ...singleAboutComponent.schema,
      exhibition_lists: {
        type: 'bloks',
        display_name: 'Exhibition Lists',
        description: 'Add multiple exhibition lists with custom headings and content',
        required: false,
        restrict_components: true,
        component_whitelist: ['ExhibitionList']
      }
    }

    // Update the component
    const updateData = {
      component: {
        name: singleAboutComponent.name,
        display_name: singleAboutComponent.display_name,
        is_root: singleAboutComponent.is_root,
        is_nestable: singleAboutComponent.is_nestable,
        component_group_uuid: singleAboutComponent.component_group_uuid,
        schema: updatedSchema
      }
    }

    await Storyblok.put(`spaces/${SPACE_ID}/components/${singleAboutComponent.id}`, updateData)
    console.log('✓ SingleAbout content type updated successfully!')
    console.log('✓ Added exhibition_lists field (blocks field for ExhibitionList components)')

    console.log('\n📝 The SingleAbout content type now supports:')
    console.log('- story_text (existing rich text field)')
    console.log('- exhibitions (existing legacy field - kept for backward compatibility)')
    console.log('- exhibition_lists (NEW - blocks field for multiple ExhibitionList components)')

  } catch (error) {
    console.error('Error updating SingleAbout content type:', error.response?.data || error.message)
  }
}

// Run the script
updateSingleAboutContentType()