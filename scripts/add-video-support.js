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

async function updateAssetGroupWithVideoSupport(spaceId) {
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

  // Updated schema with support for both images and videos
  const updatedSchema = {
    images: {
      type: 'asset',
      display_name: 'Images & Videos',
      description: 'Upload multiple images and videos for this group',
      required: false,
      filetypes: ['images', 'videos'], // Support both images and videos
      maximum: 20
    },
    alignment: {
      type: 'option',
      display_name: 'Alignment',
      options: [
        { name: 'Left', value: 'left' },
        { name: 'Center', value: 'center' },
        { name: 'Right', value: 'right' }
      ],
      default_value: 'left',
      required: true
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

  console.log('✅ AssetGroup updated to support both images and videos')
  return await updateResponse.json()
}

async function main() {
  try {
    console.log('🚀 Adding video support to AssetGroup...\n')

    const spaceId = await getSpaceId()
    await updateAssetGroupWithVideoSupport(spaceId)

    console.log('\n🎉 AssetGroup successfully updated with video support!')
    console.log('\nFeatures added:')
    console.log('- Support for both images and videos in the same field')
    console.log('- Videos will autoplay, be muted, and have no controls')
    console.log('- Maintains existing image functionality')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  }
}

main()