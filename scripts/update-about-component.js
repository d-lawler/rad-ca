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

async function updateComponent(spaceId, componentName, schema) {
  // Get existing component
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
  const existingComponent = components.find(c => c.name === componentName)

  if (!existingComponent) {
    console.log(`Component ${componentName} not found`)
    return
  }

  console.log(`Component ${componentName} exists, updating...`)

  const updateResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components/${existingComponent.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      component: {
        ...existingComponent,
        schema: schema
      }
    })
  })

  if (!updateResponse.ok) {
    throw new Error(`Failed to update component: ${updateResponse.statusText}`)
  }

  console.log(`✅ Updated ${componentName} component`)
}

async function main() {
  try {
    const spaceId = await getSpaceId()
    console.log(`Using space ID: ${spaceId}`)

    // Get existing SingleAbout component
    const getResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components`, {
      headers: {
        'Authorization': MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      }
    })

    const { components } = await getResponse.json()
    const existingSingleAbout = components.find(c => c.name === 'SingleAbout')

    // SingleAbout schema - preserve existing fields and add exhibitions
    const singleAboutSchema = {
      ...(existingSingleAbout?.schema || {}),
      exhibitions: {
        type: "options",
        source: "internal_stories",
        folder_slug: "exhibition/",
        restrict_content_types: true,
        component_whitelist: ["SingleExhibition"],
        display_name: "Exhibitions",
        description: "Select exhibitions to display on the about page"
      }
    }

    await updateComponent(spaceId, 'SingleAbout', singleAboutSchema)

    console.log('✅ SingleAbout component updated successfully!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()