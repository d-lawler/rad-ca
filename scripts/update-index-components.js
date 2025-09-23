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
    console.log(`Component ${componentName} not found, creating...`)

    const createResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components`, {
      method: 'POST',
      headers: {
        'Authorization': MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        component: {
          name: componentName,
          display_name: componentName,
          schema: schema,
          is_root: false,
          is_nestable: true
        }
      })
    })

    if (!createResponse.ok) {
      throw new Error(`Failed to create component: ${createResponse.statusText}`)
    }

    console.log(`✅ Created ${componentName} component`)
  } else {
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
}

async function main() {
  try {
    const spaceId = await getSpaceId()
    console.log(`Using space ID: ${spaceId}`)

    // Get existing schemas first
    const getResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components`, {
      headers: {
        'Authorization': MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      }
    })

    const { components } = await getResponse.json()
    const existingIndexProjects = components.find(c => c.name === 'IndexProjects')
    const existingIndexExhibition = components.find(c => c.name === 'IndexExhibition')

    // IndexProjects schema - preserve existing fields
    const indexProjectsSchema = {
      ...(existingIndexProjects?.schema || {}),
      list_type: {
        type: "option",
        use_uuid: true,
        options: [
          {
            value: "large",
            name: "Large"
          },
          {
            value: "small",
            name: "Small"
          }
        ],
        display_name: "List Type"
      },
      thumbnail_type: {
        type: "option",
        use_uuid: true,
        options: [
          {
            value: "above",
            name: "Above"
          },
          {
            value: "below",
            name: "Below"
          }
        ],
        display_name: "Thumbnail Type"
      },
      projects: {
        type: "options",
        source: "internal_stories",
        folder_slug: "project/",
        restrict_content_types: true,
        component_whitelist: ["SingleProject"],
        display_name: "Projects",
        description: "Select projects to display on this page"
      }
    }

    // IndexExhibition schema - preserve existing fields
    const indexExhibitionSchema = {
      ...(existingIndexExhibition?.schema || {}),
      exhibitions: {
        type: "options",
        source: "internal_stories",
        folder_slug: "exhibition/",
        restrict_content_types: true,
        component_whitelist: ["SingleExhibition"],
        display_name: "Exhibitions",
        description: "Select exhibitions to display on this page"
      }
    }

    await updateComponent(spaceId, 'IndexProjects', indexProjectsSchema)
    await updateComponent(spaceId, 'IndexExhibition', indexExhibitionSchema)

    console.log('✅ All components updated successfully!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()