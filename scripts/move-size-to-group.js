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

async function addSizeToAssetGroup(spaceId, assetGroupComponent) {
  console.log('🔄 Adding size option to AssetGroup...')

  const updatedSchema = {
    ...assetGroupComponent.schema,
    size: {
      type: 'option',
      display_name: 'Asset Size',
      description: 'Size for all assets in this group',
      options: [
        { name: 'Small', value: 'small' },
        { name: 'Medium', value: 'medium' },
        { name: 'Large', value: 'large' }
      ],
      default_value: 'medium',
      required: true
    }
  }

  await updateComponent(spaceId, assetGroupComponent.id, updatedSchema)
  console.log('✅ AssetGroup updated with size option')
}

async function removeSizeFromAsset(spaceId, assetComponent) {
  console.log('🔄 Removing size option from Asset...')

  // Remove width field from Asset schema
  const updatedSchema = { ...assetComponent.schema }
  delete updatedSchema.width

  await updateComponent(spaceId, assetComponent.id, updatedSchema)
  console.log('✅ Asset component simplified - removed size option')
}

async function main() {
  try {
    console.log('🚀 Moving size control to AssetGroup...\n')

    const { components, spaceId } = await getComponents()

    const assetGroupComponent = components.find(c => c.name === 'AssetGroup')
    const assetComponent = components.find(c => c.name === 'Asset')

    if (assetGroupComponent) {
      await addSizeToAssetGroup(spaceId, assetGroupComponent)
    } else {
      console.log('⚠️  AssetGroup component not found')
    }

    if (assetComponent) {
      await removeSizeFromAsset(spaceId, assetComponent)
    } else {
      console.log('⚠️  Asset component not found')
    }

    console.log('\n🎉 Size control moved to AssetGroup successfully!')
    console.log('Now you can set the size context for all assets in a group.')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()