const MANAGEMENT_TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN

if (!MANAGEMENT_TOKEN) {
  console.error('STORYBLOK_MANAGEMENT_TOKEN environment variable is required')
  process.exit(1)
}

async function getSpaceId() {
  const response = await fetch('https://mapi.storyblok.com/v1/spaces/', {
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get spaces: ${response.statusText}`)
  }

  const data = await response.json()
  return data.spaces[0].id
}

async function getComponentSchema(spaceId, componentName) {
  const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components`, {
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get components: ${response.statusText}`)
  }

  const { components } = await response.json()
  const component = components.find(c => c.name === componentName)

  if (!component) {
    console.log(`❌ Component ${componentName} not found`)
    return null
  }

  console.log(`\n📋 ${componentName} Schema:`)
  console.log(JSON.stringify(component.schema, null, 2))
  return component
}

async function main() {
  try {
    const spaceId = await getSpaceId()
    console.log(`Using space ID: ${spaceId}`)

    await getComponentSchema(spaceId, 'Content')
    await getComponentSchema(spaceId, 'AssetGroup')
    await getComponentSchema(spaceId, 'Asset')
    await getComponentSchema(spaceId, 'Assets')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()