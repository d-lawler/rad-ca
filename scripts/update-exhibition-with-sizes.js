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

async function updateComponent(spaceId, componentName, schema, isRoot = false, isNestable = true) {
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
          display_name: componentName.replace(/([A-Z])/g, ' $1').trim(),
          schema: schema,
          is_root: isRoot,
          is_nestable: isNestable
        }
      })
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`Failed to create component: ${createResponse.statusText} - ${errorText}`)
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
      const errorText = await updateResponse.text()
      throw new Error(`Failed to update component: ${updateResponse.statusText} - ${errorText}`)
    }

    console.log(`✅ Updated ${componentName} component`)
  }
}

async function main() {
  try {
    const spaceId = await getSpaceId()
    console.log(`Using space ID: ${spaceId}`)

    // First, create the ExhibitionItem component for individual exhibition entries
    const exhibitionItemSchema = {
      exhibition: {
        type: "option",
        source: "internal_stories",
        folder_slug: "exhibition/",
        restrict_content_types: true,
        component_whitelist: ["SingleExhibition"],
        display_name: "Exhibition",
        description: "Select an exhibition to display"
      },
      size: {
        type: "option",
        use_uuid: true,
        default_value: "medium",
        options: [
          {
            value: "small",
            name: "Small"
          },
          {
            value: "medium",
            name: "Medium"
          },
          {
            value: "large",
            name: "Large"
          }
        ],
        display_name: "Size",
        description: "Choose the display size for this exhibition"
      }
    }

    await updateComponent(spaceId, 'ExhibitionItem', exhibitionItemSchema, false, true)

    // Get existing IndexExhibition component to preserve other fields
    const getResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components`, {
      headers: {
        'Authorization': MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      }
    })

    const { components } = await getResponse.json()
    const existingIndexExhibition = components.find(c => c.name === 'IndexExhibition')

    // Update IndexExhibition schema to use blocks instead of options
    const indexExhibitionSchema = {
      ...(existingIndexExhibition?.schema || {}),
      exhibitions: {
        type: "bloks",
        restrict_components: true,
        component_whitelist: ["ExhibitionItem"],
        display_name: "Exhibitions",
        description: "Add exhibitions with custom sizes"
      }
    }

    await updateComponent(spaceId, 'IndexExhibition', indexExhibitionSchema, true, false)

    console.log('✅ All components updated successfully!')
    console.log('📝 You can now add exhibitions with custom sizes in your CMS')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()