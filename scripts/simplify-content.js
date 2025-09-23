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

async function simplifyContent(spaceId, contentComponent) {
  console.log('🔄 Simplifying Content blok...')

  // Create simplified schema with just asset groups
  const updatedSchema = {
    asset_groups: {
      type: 'bloks',
      display_name: 'Asset Groups',
      description: 'Add Asset Group components',
      restrict_type: 'AssetGroup',
      restrict_components: true,
      required: false
    }
  }

  await updateComponent(spaceId, contentComponent.id, updatedSchema)
  console.log('✅ Content blok simplified - only asset groups remain')
}

async function main() {
  try {
    console.log('🚀 Simplifying Content component...\n')

    const { components, spaceId } = await getComponents()

    const contentComponent = components.find(c => c.name === 'Content')

    if (contentComponent) {
      await simplifyContent(spaceId, contentComponent)
    } else {
      console.log('⚠️  Content component not found')
    }

    console.log('\n🎉 Content simplified successfully!')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()