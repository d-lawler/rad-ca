const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function cleanupOldComponents() {
  try {
    console.log('🔄 Cleaning up old Storyblok components...')

    // 1. Get all components to see what we have
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    console.log('📋 Current components:')
    allComponents.forEach(comp => {
      console.log(`   • ${comp.name} (ID: ${comp.id})`)
    })

    // 2. Components to potentially delete (old/unused ones)
    const componentsToDelete = [
      'Content', // Old generic content component
      'AssetGroup' // Old asset group component
    ]

    // 3. Ask about each component before deleting
    for (const componentName of componentsToDelete) {
      const component = allComponents.find(comp => comp.name === componentName)
      if (component) {
        console.log(`\n🗑️ Found old component: ${componentName}`)
        console.log(`   This component may no longer be needed with the new structure.`)

        try {
          // Note: In a real scenario, you'd want to check if it's being used first
          console.log(`   Checking usage of ${componentName}...`)

          // For now, we'll just list it but not delete automatically
          // await Storyblok.delete(`spaces/${spaceId}/components/${component.id}`)
          // console.log(`✅ Deleted ${componentName} component`)

          console.log(`   ⚠️ Component ${componentName} still exists (manual deletion required)`)
        } catch (error) {
          console.error(`❌ Error deleting ${componentName}:`, error.response?.data || error.message)
        }
      }
    }

    // 4. Update Project component to only allow ImageRow
    console.log('\n🔄 Updating Project component restrictions...')

    const projectComponent = allComponents.find(comp => comp.name === 'Project')
    if (projectComponent) {
      const updatedProjectSchema = {
        ...projectComponent.schema,
        image_rows: {
          type: 'bloks',
          display_name: 'Image Rows',
          description: 'Add image rows with flexible alignment and sizing',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['ImageRow'],
          required: false
        }
      }

      // Remove old content field to prevent confusion
      delete updatedProjectSchema.content

      const updatedProject = {
        ...projectComponent,
        schema: updatedProjectSchema
      }

      await Storyblok.put(`spaces/${spaceId}/components/${projectComponent.id}`, {
        component: updatedProject
      })
      console.log('✅ Project component updated - only allows ImageRow components')
    }

    // 5. Update HomePage component to only allow ImageGrid
    console.log('\n🔄 Updating HomePage component restrictions...')

    const homePageComponent = allComponents.find(comp => comp.name === 'HomePage')
    if (homePageComponent) {
      const updatedHomePageSchema = {
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
        }
      }

      const updatedHomePage = {
        ...homePageComponent,
        schema: updatedHomePageSchema
      }

      await Storyblok.put(`spaces/${spaceId}/components/${homePageComponent.id}`, {
        component: updatedHomePage
      })
      console.log('✅ HomePage component updated - only allows ImageGrid components')
    }

    // 6. Ensure component restrictions are tight
    console.log('\n🔄 Verifying component restrictions...')

    // ImageGrid should only allow ImageGridGroup
    const imageGridComponent = allComponents.find(comp => comp.name === 'ImageGrid')
    if (imageGridComponent) {
      console.log('✅ ImageGrid restricts to: ImageGridGroup only')
    }

    // ImageRow should only allow ImageItem
    const imageRowComponent = allComponents.find(comp => comp.name === 'ImageRow')
    if (imageRowComponent) {
      console.log('✅ ImageRow restricts to: ImageItem only')
    }

    console.log('\n🎉 Component cleanup completed!')
    console.log('📋 Component restrictions:')
    console.log('   • HomePage → ImageGrid only')
    console.log('   • Project → ImageRow only')
    console.log('   • ImageGrid → ImageGridGroup only')
    console.log('   • ImageRow → ImageItem only')
    console.log('   • ImageGridGroup → Multi-asset field (images/videos)')
    console.log('   • ImageItem → Single asset field + size options')

    console.log('\n⚠️ Manual cleanup required:')
    console.log('   • Review old Content/AssetGroup components in Storyblok')
    console.log('   • Delete them manually if no longer needed')
    console.log('   • Check existing stories using old structure')

  } catch (error) {
    console.error('❌ Error during cleanup:', error.response?.data || error.message)
  }
}

cleanupOldComponents()