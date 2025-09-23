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

async function createExhibitionTemplate() {
  const componentData = {
    name: 'ExhibitionPage',
    display_name: 'Exhibition Page',
    schema: {
      title: {
        type: 'text',
        display_name: 'Exhibition Title',
        description: 'Name of the exhibition',
        required: true
      },
      subtitle: {
        type: 'text',
        display_name: 'Subtitle/Theme',
        description: 'Exhibition theme or subtitle',
        required: false
      },
      start_date: {
        type: 'datetime',
        display_name: 'Start Date',
        description: 'When the exhibition opens',
        required: false
      },
      end_date: {
        type: 'datetime',
        display_name: 'End Date',
        description: 'When the exhibition closes',
        required: false
      },
      location: {
        type: 'text',
        display_name: 'Location/Venue',
        description: 'Where the exhibition is held',
        required: false
      },
      featured_image: {
        type: 'asset',
        display_name: 'Featured Image',
        description: 'Main exhibition image',
        required: false,
        filetypes: ['images']
      },
      description: {
        type: 'richtext',
        display_name: 'Exhibition Description',
        description: 'Overview and details about the exhibition',
        required: false
      },
      curator_note: {
        type: 'richtext',
        display_name: 'Curator\'s Note',
        description: 'Statement from the curator',
        required: false
      },
      status: {
        type: 'option',
        display_name: 'Exhibition Status',
        description: 'Current status of the exhibition',
        options: [
          { name: 'Upcoming', value: 'upcoming' },
          { name: 'Current', value: 'current' },
          { name: 'Past', value: 'past' }
        ],
        default_value: 'upcoming',
        required: true
      },
      content: {
        type: 'bloks',
        display_name: 'Exhibition Content',
        description: 'Add content sections and galleries',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['Text', 'Content', 'AssetGroup'],
        required: false
      },
      gallery: {
        type: 'bloks',
        display_name: 'Exhibition Gallery',
        description: 'Featured artworks and images',
        restrict_type: 'AssetGroup',
        restrict_components: true,
        required: false
      },
      opening_hours: {
        type: 'text',
        display_name: 'Opening Hours',
        description: 'When the exhibition is open to visitors',
        required: false
      },
      admission: {
        type: 'text',
        display_name: 'Admission Info',
        description: 'Ticket prices and booking information',
        required: false
      }
    },
    is_root: true,
    is_nestable: false,
    component_group_uuid: null,
    color: '#f59e0b',
    icon: 'block-image'
  }

  return await createComponent(componentData)
}

async function main() {
  try {
    console.log('🚀 Creating Exhibition page template...\n')

    await createExhibitionTemplate()

    console.log('\n🎉 Exhibition page template created successfully!')
    console.log('You can now create Exhibition pages using this template in Storyblok.')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()