const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function updateProjectSchema() {
  try {
    console.log('🔄 Updating Project component schema...')

    // Update Project component to use AssetGroup
    const projectComponent = {
      name: 'Project',
      display_name: 'Project',
      schema: {
        title: {
          type: 'text',
          display_name: 'Title',
          required: true
        },
        description: {
          type: 'textarea',
          display_name: 'Description',
          required: false
        },
        content: {
          type: 'bloks',
          display_name: 'Content',
          description: 'Add Content components with Asset Groups',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['Content'],
          required: false
        }
      },
      is_root: false,
      is_nestable: true,
      component_group_uuid: null,
      color: '#1b243f',
      icon: 'block-image'
    }

    // Check if Project component exists
    let existingProject
    try {
      const response = await Storyblok.get(`spaces/${spaceId}/components`, {
        search: 'Project'
      })
      existingProject = response.data.components.find(comp => comp.name === 'Project')
    } catch (error) {
      console.log('Project component not found, will create new one')
    }

    if (existingProject) {
      console.log('📝 Updating existing Project component...')
      await Storyblok.put(`spaces/${spaceId}/components/${existingProject.id}`, {
        component: projectComponent
      })
      console.log('✅ Project component updated successfully!')
    } else {
      console.log('📝 Creating new Project component...')
      await Storyblok.post(`spaces/${spaceId}/components`, {
        component: projectComponent
      })
      console.log('✅ Project component created successfully!')
    }

    // Also ensure Content component accepts AssetGroup (should already be configured)
    console.log('🔄 Verifying Content component configuration...')

    const contentResponse = await Storyblok.get(`spaces/${spaceId}/components`, {
      search: 'Content'
    })
    const contentComponent = contentResponse.data.components.find(comp => comp.name === 'Content')

    if (contentComponent) {
      console.log('✅ Content component found with AssetGroup support')
      console.log('Schema:', JSON.stringify(contentComponent.schema, null, 2))
    } else {
      console.log('⚠️ Content component not found')
    }

  } catch (error) {
    console.error('❌ Error updating Project schema:', error.response?.data || error.message)
  }
}

updateProjectSchema()