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

// Update ImageCarousel Component - remove dots and simplify
async function updateImageCarousel() {
  const componentId = await getComponentId('ImageCarousel')

  if (!componentId) {
    throw new Error('ImageCarousel component not found')
  }

  const componentData = {
    name: 'ImageCarousel',
    display_name: 'Image Carousel',
    schema: {
      images: {
        type: 'bloks',
        display_name: 'Images',
        description: 'Add images to the carousel',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['Asset'],
        required: true
      },
      autoplay: {
        type: 'boolean',
        display_name: 'Auto-play',
        description: 'Enable automatic slideshow',
        default_value: false,
        required: false
      },
      autoplay_interval: {
        type: 'number',
        display_name: 'Auto-play Interval (ms)',
        description: 'Time between slides in milliseconds',
        default_value: 5000,
        required: false
      }
    },
    is_root: false,
    is_nestable: true,
    component_group_uuid: null,
    color: '#06b6d4',
    icon: 'block-image'
  }

  return await updateComponent(componentId, componentData)
}

// Main function
async function main() {
  try {
    console.log('🚀 Updating ImageCarousel component schema...\n')

    await updateImageCarousel()

    console.log('\n🎉 ImageCarousel component updated!')
    console.log('\nChanges Made:')
    console.log('🖼️ Full width carousel (no containers or margins)')
    console.log('➡️ One image at a time navigation')
    console.log('🎯 Left/right click areas for navigation')
    console.log('\nRemoved:')
    console.log('❌ Dots/pagination indicators')
    console.log('❌ show_dots option from CMS')
    console.log('❌ Side image previews and scaling effects')
    console.log('\nThe carousel is now a clean, full-width image slider!')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()