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

async function createComponent(spaceId) {
  // Check if component already exists
  const getResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components`, {
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    }
  })

  if (!getResponse.ok) {
    throw new Error(`Failed to get components: ${getResponse.statusText}`)
  }

  const { components } = await getResponse.json()
  const existingComponent = components.find(c => c.name === 'SingleStuff')

  if (existingComponent) {
    console.log('SingleStuff component already exists')
    return
  }

  const componentSchema = {
    // No fields needed for now - just pulls all products from Shopify
  }

  const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components`, {
    method: 'POST',
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      component: {
        name: 'SingleStuff',
        display_name: 'Single Stuff',
        schema: componentSchema,
        is_root: true,
        is_nestable: false,
        component_group_uuid: null
      }
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to create component: ${response.statusText} - ${JSON.stringify(errorData)}`)
  }

  console.log('✅ SingleStuff component created successfully!')
}

async function main() {
  try {
    const spaceId = await getSpaceId()
    console.log(`Using space ID: ${spaceId}`)

    await createComponent(spaceId)

    console.log('✅ SingleStuff component is ready!')
    console.log('You can now create a "Stuff" page in Storyblok using the SingleStuff component.')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()