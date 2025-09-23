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

async function updateContentBlok(spaceId, contentComponent) {
  console.log('🔄 Updating Content blok to include Text...')

  // Find the asset_groups field and update it to also allow Text bloks
  const updatedSchema = { ...contentComponent.schema }

  // If asset_groups exists, update it to also allow Text
  if (updatedSchema.asset_groups) {
    // Change restrict_type to empty and add restrict_components with both AssetGroup and Text
    updatedSchema.asset_groups = {
      ...updatedSchema.asset_groups,
      restrict_type: '',
      restrict_components: true,
      component_whitelist: ['AssetGroup', 'Text']
    }
  } else {
    // If no asset_groups field, create a content field
    updatedSchema.content = {
      type: 'bloks',
      display_name: 'Content',
      description: 'Add content blocks',
      restrict_type: '',
      restrict_components: true,
      component_whitelist: ['AssetGroup', 'Text'],
      required: false
    }
  }

  await updateComponent(spaceId, contentComponent.id, updatedSchema)
  console.log('✅ Content blok updated to allow Text components')
}

async function main() {
  try {
    console.log('🚀 Adding Text blok to Content component...\n')

    const { components, spaceId } = await getComponents()

    // Find Content component
    const contentComponent = components.find(c => c.name === 'Content')

    if (contentComponent) {
      await updateContentBlok(spaceId, contentComponent)
    } else {
      console.log('⚠️  Content component not found')
    }

    console.log('\n🎉 Content component updated successfully!')
    console.log('You can now add Text bloks to your Content pages!')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()