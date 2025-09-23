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

async function getComponents() {
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
  return { components: data.components, spaceId: SPACE_ID }
}

async function updateComponent(spaceId, componentId, updatedSchema) {
  const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components/${componentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ component: { schema: updatedSchema } })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update component: ${response.status} - ${error}`)
  }

  return await response.json()
}

async function simplifyAssetGroup(spaceId, assetGroupComponent) {
  console.log('🔄 Simplifying AssetGroup blok...')

  // Create simplified schema with only assets and alignment
  const updatedSchema = {
    assets: {
      type: 'bloks',
      display_name: 'Assets',
      description: 'Add Asset components to this group',
      restrict_type: 'Asset',
      restrict_components: true,
      required: false
    },
    alignment: {
      type: 'option',
      display_name: 'Alignment',
      description: 'How to align assets horizontally',
      options: [
        { name: 'Left', value: 'left' },
        { name: 'Center', value: 'center' },
        { name: 'Right', value: 'right' }
      ],
      default_value: 'left',
      required: true
    }
  }

  await updateComponent(spaceId, assetGroupComponent.id, updatedSchema)
  console.log('✅ AssetGroup blok simplified - removed title and layout options')
}

async function main() {
  try {
    console.log('🚀 Simplifying AssetGroup component...\n')

    const { components, spaceId } = await getComponents()

    const assetGroupComponent = components.find(c => c.name === 'AssetGroup')

    if (assetGroupComponent) {
      await simplifyAssetGroup(spaceId, assetGroupComponent)
    } else {
      console.log('⚠️  AssetGroup component not found')
    }

    console.log('\n🎉 AssetGroup simplified successfully!')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()