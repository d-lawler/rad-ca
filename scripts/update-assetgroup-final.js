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

async function updateAssetGroupFinal(spaceId) {
  // Get current AssetGroup component
  const getResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components`, {
    headers: {
      'Authorization': MANAGEMENT_TOKEN
    }
  })

  const data = await getResponse.json()
  const assetGroupComponent = data.components.find(comp => comp.name === 'AssetGroup')

  if (!assetGroupComponent) {
    throw new Error('AssetGroup component not found')
  }

  // Final schema with all requirements
  const updatedSchema = {
    images: {
      type: 'multiasset', // Ensure multi-image upload
      display_name: 'Images & Videos',
      description: 'Upload multiple images and videos for this group',
      required: false,
      filetypes: ['images', 'videos'],
      maximum: 50 // Increased limit
    },
    alignment: {
      type: 'option',
      display_name: 'Alignment',
      options: [
        { name: 'Left', value: 'left' },
        { name: 'Center', value: 'center' },
        { name: 'Right', value: 'right' }
      ],
      default_value: 'center',
      required: false // Made optional
    },
    size: {
      type: 'option',
      display_name: 'Size',
      options: [
        { name: 'Large', value: 'large' },
        { name: 'Medium', value: 'medium' },
        { name: 'Small', value: 'small' }
      ],
      required: false // No default, not required
    }
  }

  // Update component
  const updateResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components/${assetGroupComponent.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ component: { schema: updatedSchema } })
  })

  if (!updateResponse.ok) {
    const error = await updateResponse.text()
    throw new Error(`Failed to update AssetGroup: ${updateResponse.status} - ${error}`)
  }

  console.log('✅ AssetGroup updated with final configuration')
  return await updateResponse.json()
}

async function main() {
  try {
    console.log('🚀 Updating AssetGroup with final configuration...\n')

    const spaceId = await getSpaceId()
    await updateAssetGroupFinal(spaceId)

    console.log('\n🎉 AssetGroup successfully updated!')
    console.log('\nFinal configuration:')
    console.log('✅ Multi-image upload field (up to 50 items)')
    console.log('✅ Alignment optional (defaults to center)')
    console.log('✅ Size option added (large/medium/small, no default)')
    console.log('✅ Supports both images and videos')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  }
}

main()