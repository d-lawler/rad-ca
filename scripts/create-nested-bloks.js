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

async function createAssetGroup() {
  const componentData = {
    name: 'AssetGroup',
    display_name: 'Asset Group',
    schema: {
      title: {
        type: 'text',
        display_name: 'Group Title',
        description: 'Optional title for this asset group',
        required: false
      },
      layout: {
        type: 'option',
        display_name: 'Layout Style',
        description: 'How to display the assets',
        options: [
          { name: 'Grid', value: 'grid' },
          { name: 'Carousel', value: 'carousel' },
          { name: 'Masonry', value: 'masonry' },
          { name: 'Single Column', value: 'column' }
        ],
        default_value: 'grid',
        required: true
      },
      assets: {
        type: 'bloks',
        display_name: 'Assets',
        description: 'Add Asset components to this group',
        restrict_type: 'Asset',
        restrict_components: true,
        required: false
      }
    },
    is_root: false,
    is_nestable: true,
    component_group_uuid: null,
    color: '#2563eb',
    icon: 'block-image-text'
  }
  
  return await createComponent(componentData)
}

async function createContent() {
  const componentData = {
    name: 'Content',
    display_name: 'Content',
    schema: {
      headline: {
        type: 'text',
        display_name: 'Headline',
        description: 'Main headline for this content section',
        required: false
      },
      description: {
        type: 'textarea',
        display_name: 'Description',
        description: 'Optional description or intro text',
        required: false
      },
      asset_groups: {
        type: 'bloks',
        display_name: 'Asset Groups',
        description: 'Add Asset Group components',
        restrict_type: 'AssetGroup',
        restrict_components: true,
        required: false
      },
      background_color: {
        type: 'option',
        display_name: 'Background Color',
        options: [
          { name: 'White', value: 'white' },
          { name: 'Light Gray', value: 'gray-50' },
          { name: 'Dark', value: 'gray-900' },
          { name: 'Primary', value: 'primary' }
        ],
        default_value: 'white',
        required: true
      }
    },
    is_root: false,
    is_nestable: true,
    component_group_uuid: null,
    color: '#059669',
    icon: 'block-doc'
  }
  
  return await createComponent(componentData)
}

// Run the script
async function main() {
  try {
    console.log('🚀 Creating nested bloks...\n')
    
    await createAssetGroup()
    await createContent()
    
    console.log('\n🎉 All nested bloks created successfully!')
    console.log('\nComponent hierarchy:')
    console.log('📄 Content')
    console.log('  └── 📁 AssetGroup')
    console.log('      └── 🖼️  Asset')
    
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  }
}

main()