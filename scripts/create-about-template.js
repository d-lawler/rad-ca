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
    console.log(`✅ ${componentData.name} template created successfully!`)
    console.log('Component ID:', result.component.id)

    return result
  } catch (error) {
    console.error(`❌ Error creating ${componentData.name} template:`, error.message)
    throw error
  }
}

async function createAboutTemplate() {
  const componentData = {
    name: 'AboutPage',
    display_name: 'About Page',
    schema: {
      title: {
        type: 'text',
        display_name: 'Page Title',
        description: 'Main title for the about page',
        required: true,
        default_value: 'About'
      },
      subtitle: {
        type: 'text',
        display_name: 'Subtitle',
        description: 'Optional subtitle or tagline',
        required: false
      },
      hero_image: {
        type: 'asset',
        display_name: 'Hero Image',
        description: 'Main image for the about page',
        required: false,
        filetypes: ['images']
      },
      intro_text: {
        type: 'richtext',
        display_name: 'Introduction Text',
        description: 'Opening paragraph or introduction',
        required: false
      },
      content: {
        type: 'bloks',
        display_name: 'Content Blocks',
        description: 'Add content sections',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['Text', 'Content', 'AssetGroup'],
        required: false
      },
      contact_info: {
        type: 'text',
        display_name: 'Contact Information',
        description: 'Contact details or email',
        required: false
      },
      social_links: {
        type: 'text',
        display_name: 'Social Links',
        description: 'Links to social media profiles',
        required: false
      }
    },
    is_root: true,
    is_nestable: false,
    component_group_uuid: null,
    color: '#7c3aed',
    icon: 'block-user'
  }

  return await createComponent(componentData)
}

async function main() {
  try {
    console.log('🚀 Creating About page template...\n')

    await createAboutTemplate()

    console.log('\n🎉 About page template created successfully!')
    console.log('You can now create an About page using this template in Storyblok.')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()