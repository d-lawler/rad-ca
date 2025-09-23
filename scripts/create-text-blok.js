import { config } from 'dotenv'

// Load environment variables
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

async function createComponent(componentData) {
  const SPACE_ID = await getSpaceId()

  try {
    const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/components`, {
      method: 'POST',
      headers: {
        'Authorization': MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ component: componentData })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create component: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log(`✅ ${componentData.name} blok created successfully!`)
    console.log('Component ID:', result.component.id)

    return result
  } catch (error) {
    console.error(`❌ Error creating ${componentData.name} blok:`, error.message)
    throw error
  }
}

async function createTextBlok() {
  const componentData = {
    name: 'Text',
    display_name: 'Text',
    schema: {
      text: {
        type: 'richtext',
        display_name: 'Text',
        description: 'Rich text content',
        required: false
      }
    },
    is_root: false,
    is_nestable: true,
    component_group_uuid: null,
    color: '#10b981',
    icon: 'block-text'
  }

  return await createComponent(componentData)
}

// Run the script
async function main() {
  try {
    console.log('🚀 Creating Text blok...\n')

    await createTextBlok()

    console.log('\n🎉 Text blok created successfully!')

  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  }
}

main()