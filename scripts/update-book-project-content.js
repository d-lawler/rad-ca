import { config } from 'dotenv'

config()

const MANAGEMENT_TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN

async function getSpaceId() {
  const response = await fetch('https://mapi.storyblok.com/v1/spaces/', {
    headers: {
      'Authorization': MANAGEMENT_TOKEN
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get spaces: ${response.status}`)
  }

  const data = await response.json()
  return data.spaces[0]?.id
}

async function getComponentId(componentName) {
  const SPACE_ID = await getSpaceId()

  const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/components`, {
    headers: {
      'Authorization': MANAGEMENT_TOKEN
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get components: ${response.status}`)
  }

  const data = await response.json()
  const component = data.components.find(comp => comp.name === componentName)

  return component?.id
}

async function updateComponent(componentId, componentData) {
  const SPACE_ID = await getSpaceId()

  try {
    const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/components/${componentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ component: componentData })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update component: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log(`✅ ${componentData.name} updated successfully!`)
    console.log('Component ID:', result.component.id)

    return result
  } catch (error) {
    console.error(`❌ Error updating ${componentData.name}:`, error.message)
    throw error
  }
}

// Update SingleBook Component content field
async function updateSingleBook() {
  const componentId = await getComponentId('SingleBook')

  if (!componentId) {
    throw new Error('SingleBook component not found')
  }

  const componentData = {
    name: 'SingleBook',
    display_name: 'Single Book',
    schema: {
      name: {
        type: 'text',
        display_name: 'Book Name',
        description: 'Name of the book',
        required: true
      },
      story_text: {
        type: 'richtext',
        display_name: 'Story Text',
        description: 'Main text content for the book',
        required: false
      },
      featured_image: {
        type: 'asset',
        display_name: 'Featured Image',
        description: 'Main book cover or featured image',
        required: false,
        filetypes: ['images']
      },
      content: {
        type: 'bloks',
        display_name: 'Content',
        description: 'Add content blocks - images, videos, carousels',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['ImageRow', 'VideoPlayer', 'ImageCarousel'],
        required: false
      }
    },
    is_root: true,
    is_nestable: false,
    component_group_uuid: null,
    color: '#8b5cf6',
    icon: 'block-doc'
  }

  return await updateComponent(componentId, componentData)
}

// Update SingleProject Component content field
async function updateSingleProject() {
  const componentId = await getComponentId('SingleProject')

  if (!componentId) {
    throw new Error('SingleProject component not found')
  }

  const componentData = {
    name: 'SingleProject',
    display_name: 'Single Project',
    schema: {
      name: {
        type: 'text',
        display_name: 'Project Name',
        description: 'Name of the project',
        required: true
      },
      story_text: {
        type: 'richtext',
        display_name: 'Story Text',
        description: 'Main text content for the project',
        required: false
      },
      featured_image: {
        type: 'asset',
        display_name: 'Featured Image',
        description: 'Main project image or thumbnail',
        required: false,
        filetypes: ['images']
      },
      content: {
        type: 'bloks',
        display_name: 'Content',
        description: 'Add content blocks - images, videos, carousels',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['ImageRow', 'VideoPlayer', 'ImageCarousel'],
        required: false
      }
    },
    is_root: true,
    is_nestable: false,
    component_group_uuid: null,
    color: '#3b82f6',
    icon: 'block-doc'
  }

  return await updateComponent(componentId, componentData)
}

// Main function
async function main() {
  try {
    console.log('🚀 Updating SingleBook and SingleProject content field restrictions...\n')

    console.log('📖 Updating SingleBook Component:')
    await updateSingleBook()

    console.log('\n📋 Updating SingleProject Component:')
    await updateSingleProject()

    console.log('\n🎉 Book and Project components updated successfully!')
    console.log('\nAllowed Content Components:')
    console.log('📸 ImageRow - Image rows with alignment options')
    console.log('🎬 VideoPlayer - Vimeo videos with cover/poster')
    console.log('🎠 ImageCarousel - Multi-image carousels')
    console.log('\nExcluded Components:')
    console.log('❌ ImageGridGroup - Not available in books/projects')
    console.log('\nContent creators can now build rich multimedia stories!')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()