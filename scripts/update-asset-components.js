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

async function createComponent(componentData) {
  const SPACE_ID = await getSpaceId()

  try {
    const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/components`, {
      method: 'POST',
      headers: {
        'Authorization': MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ component: componentData })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create component: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log(`✅ ${componentData.name} created successfully!`)
    console.log('Component ID:', result.component.id)

    return result
  } catch (error) {
    console.error(`❌ Error creating ${componentData.name}:`, error.message)
    throw error
  }
}

// Assets Component (individual asset item)
async function createAssets() {
  const componentData = {
    name: 'Assets',
    display_name: 'Assets',
    schema: {
      image: {
        type: 'asset',
        display_name: 'Image',
        description: 'Single image asset',
        required: true,
        filetypes: ['images']
      }
    },
    is_root: false,
    is_nestable: true,
    component_group_uuid: null,
    color: '#06b6d4',
    icon: 'block-image'
  }

  return await createComponent(componentData)
}

// Update AssetGroup to use Assets components
async function updateAssetGroup() {
  const SPACE_ID = await getSpaceId()

  try {
    // First, get the existing AssetGroup component
    const getResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/components`, {
      headers: {
        'Authorization': MANAGEMENT_TOKEN
      }
    })

    if (!getResponse.ok) {
      throw new Error(`Failed to get components: ${getResponse.status}`)
    }

    const data = await getResponse.json()
    const assetGroupComponent = data.components.find(comp => comp.name === 'AssetGroup')

    if (!assetGroupComponent) {
      throw new Error('AssetGroup component not found')
    }

    // Update the component schema
    const updateData = {
      name: 'AssetGroup',
      display_name: 'Asset Group',
      schema: {
        assets: {
          type: 'bloks',
          display_name: 'Assets',
          description: 'Add individual asset items',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['Assets'],
          required: false
        }
      },
      is_root: false,
      is_nestable: true,
      component_group_uuid: null,
      color: '#0ea5e9',
      icon: 'block-folder'
    }

    const updateResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/components/${assetGroupComponent.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ component: updateData })
    })

    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      throw new Error(`Failed to update AssetGroup: ${updateResponse.status} - ${error}`)
    }

    console.log('✅ AssetGroup updated successfully!')
    return await updateResponse.json()

  } catch (error) {
    console.error('❌ Error updating AssetGroup:', error.message)
    throw error
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Updating asset components for Christopher Anderson portfolio...\n')

    console.log('📸 Creating Assets component:')
    await createAssets()

    console.log('\n📁 Updating AssetGroup component:')
    await updateAssetGroup()

    console.log('\n🎉 Asset components updated successfully!')
    console.log('\nComponent Summary:')
    console.log('📸 Assets - Individual image assets')
    console.log('📁 AssetGroup - Container for multiple Assets components')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()