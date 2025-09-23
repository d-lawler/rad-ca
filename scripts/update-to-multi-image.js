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

async function updateAssetGroupToMultiImage(spaceId) {
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

  // Updated schema with multi-asset field
  const updatedSchema = {
    images: {
      type: 'asset',
      display_name: 'Images',
      description: 'Upload multiple images for this group',
      required: false,
      filetypes: ['images'],
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

  console.log('✅ AssetGroup updated to use multi-image field')
  return await updateResponse.json()
}

async function main() {
  try {
    console.log('🚀 Updating AssetGroup to use multi-image fields...\n')

    const spaceId = await getSpaceId()
    await updateAssetGroupToMultiImage(spaceId)

    console.log('\n🎉 AssetGroup successfully updated to multi-image!')
    console.log('\nNext steps:')
    console.log('1. Update the AssetGroup.vue component to handle the new images array')
    console.log('2. Migrate existing content from nested Asset bloks to the new images field')
    console.log('3. Test the updated component in Storyblok editor')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  }
}

main()