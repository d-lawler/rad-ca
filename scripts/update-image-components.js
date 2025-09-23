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

// Update ImageRow Component with alignment options
async function updateImageRow() {
  const componentId = await getComponentId('ImageRow')

  if (!componentId) {
    throw new Error('ImageRow component not found')
  }

  const componentData = {
    name: 'ImageRow',
    display_name: 'Image Row',
    schema: {
      images: {
        type: 'bloks',
        display_name: 'Images',
        description: 'Add images to this row',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['ImageItem'],
        required: false
      },
      alignment: {
        type: 'option',
        display_name: 'Alignment',
        description: 'How to align the images in this row',
        options: [
          { name: 'Left', value: 'left' },
          { name: 'Center', value: 'center' },
          { name: 'Right', value: 'right' }
        ],
        default_value: 'center',
        required: false
      }
    },
    is_root: false,
    is_nestable: true,
    component_group_uuid: null,
    color: '#3b82f6',
    icon: 'block-image'
  }

  return await updateComponent(componentId, componentData)
}

// Update ImageItem Component with size options
async function updateImageItem() {
  const componentId = await getComponentId('ImageItem')

  if (!componentId) {
    throw new Error('ImageItem component not found')
  }

  const componentData = {
    name: 'ImageItem',
    display_name: 'Image Item',
    schema: {
      image: {
        type: 'asset',
        display_name: 'Image',
        description: 'Upload an image',
        required: true,
        filetypes: ['images', 'videos']
      },
      size: {
        type: 'option',
        display_name: 'Size',
        description: 'Size of this image',
        options: [
          { name: 'Quarter (25%)', value: 'quarter' },
          { name: 'Third (33%)', value: 'third' },
          { name: 'Half (50%)', value: 'half' },
          { name: 'Two Thirds (66%)', value: 'twothirds' },
          { name: 'Full (100%)', value: 'full' }
        ],
        default_value: 'half',
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
    console.log('🚀 Updating ImageRow and ImageItem components with alignment and size options...\n')

    console.log('📸 Updating ImageRow Component with alignment options:')
    await updateImageRow()

    console.log('\n🖼️ Updating ImageItem Component with size options:')
    await updateImageItem()

    console.log('\n🎉 Image components updated successfully!')
    console.log('\nNew Features:')
    console.log('📐 ImageRow Alignment: Left, Center, Right')
    console.log('📏 ImageItem Size: Small, Medium, Large')
    console.log('\nThese options are now available in IndexProjects and IndexBooks!')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()