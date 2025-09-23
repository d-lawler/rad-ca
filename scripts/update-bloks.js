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

async function updateAssetBlok(spaceId, assetComponent) {
  console.log('🔄 Updating Asset blok...')
  
  const updatedSchema = {
    ...assetComponent.schema,
    width: {
      type: 'option',
      display_name: 'Width',
      description: 'Size of the asset display',
      options: [
        { name: 'Small', value: 'small' },
        { name: 'Medium', value: 'medium' },
        { name: 'Large', value: 'large' }
      ],
      default_value: 'medium',
      required: true
    }
  }
  
  await updateComponent(spaceId, assetComponent.id, updatedSchema)
  console.log('✅ Asset blok updated with width option')
}

async function updateAssetGroupBlok(spaceId, assetGroupComponent) {
  console.log('🔄 Updating AssetGroup blok...')
  
  const updatedSchema = {
    ...assetGroupComponent.schema,
    horizontal_alignment: {
      type: 'option',
      display_name: 'Horizontal Alignment',
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
  console.log('✅ AssetGroup blok updated with horizontal alignment')
}

async function main() {
  try {
    console.log('🚀 Updating existing bloks...\n')
    
    const { components, spaceId } = await getComponents()
    
    // Find Asset and AssetGroup components
    const assetComponent = components.find(c => c.name === 'Asset')
    const assetGroupComponent = components.find(c => c.name === 'AssetGroup')
    
    if (assetComponent) {
      await updateAssetBlok(spaceId, assetComponent)
    } else {
      console.log('⚠️  Asset component not found')
    }
    
    if (assetGroupComponent) {
      await updateAssetGroupBlok(spaceId, assetGroupComponent)
    } else {
      console.log('⚠️  AssetGroup component not found')
    }
    
    console.log('\n🎉 All bloks updated successfully!')
    
  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()