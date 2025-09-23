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

async function createAssetBlok() {
  const SPACE_ID = await getSpaceId()
  console.log('Using Space ID:', SPACE_ID)
  const componentData = {
    component: {
      name: 'Asset',
      display_name: 'Asset',
      schema: {
        asset: {
          type: 'asset',
          filetypes: ['images', 'videos'],
          display_name: 'Asset File',
          description: 'Upload an image or video asset',
          required: true
        }
      },
      is_root: false,
      is_nestable: true,
      component_group_uuid: null,
      color: '#1b243f',
      icon: 'block-image'
    }
  }

  try {
    const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/components`, {
      method: 'POST',
      headers: {
        'Authorization': MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(componentData)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create component: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log('✅ Asset blok created successfully!')
    console.log('Component ID:', result.component.id)
    console.log('Component Name:', result.component.name)
    
    return result
  } catch (error) {
    console.error('❌ Error creating Asset blok:', error.message)
    throw error
  }
}

// Run the script
createAssetBlok()
  .then(() => {
    console.log('🎉 Asset blok is ready to use!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })