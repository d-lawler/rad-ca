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
    console.log(`✅ ${componentData.name} created successfully!`)
    console.log('Component ID:', result.component.id)

    return result
  } catch (error) {
    console.error(`❌ Error creating ${componentData.name}:`, error.message)
    throw error
  }
}

// IndexProjects Component
async function createIndexProjects() {
  const componentData = {
    name: 'IndexProjects',
    display_name: 'Index Projects',
    schema: {
      projects: {
        type: 'bloks',
        display_name: 'Projects',
        description: 'Add project blocks',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['SingleProject'],
        required: false
      },
      list_type: {
        type: 'option',
        display_name: 'List Type',
        description: 'How to display the project text',
        options: [
          { name: 'Large Text', value: 'large_text' },
          { name: 'Small Text', value: 'small_text' }
        ],
        default_value: 'large_text',
        required: true
      },
      thumbnail_type: {
        type: 'option',
        display_name: 'Thumbnail Type',
        description: 'Position of thumbnails relative to text',
        options: [
          { name: 'Below', value: 'below' },
          { name: 'Above', value: 'above' }
        ],
        default_value: 'below',
        required: true
      }
    },
    is_root: true,
    is_nestable: false,
    component_group_uuid: null,
    color: '#3b82f6',
    icon: 'block-list'
  }

  return await createComponent(componentData)
}

// SingleProject Component
async function createSingleProject() {
  const componentData = {
    name: 'SingleProject',
    display_name: 'Single Project',
    schema: {
      story_text: {
        type: 'richtext',
        display_name: 'Story Text',
        description: 'Main text content for the project',
        required: false
      },
      content: {
        type: 'bloks',
        display_name: 'Content',
        description: 'Add content blocks',
        restrict_type: 'Content',
        restrict_components: true,
        required: false
      }
    },
    is_root: true,
    is_nestable: false,
    component_group_uuid: null,
    color: '#8b5cf6',
    icon: 'block-doc'
  }

  return await createComponent(componentData)
}

// IndexExhibition Component
async function createIndexExhibition() {
  const componentData = {
    name: 'IndexExhibition',
    display_name: 'Index Exhibition',
    schema: {
      content: {
        type: 'bloks',
        display_name: 'Exhibitions',
        description: 'Add exhibition blocks',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['SingleExhibition'],
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

// SingleExhibition Component
async function createSingleExhibition() {
  const componentData = {
    name: 'SingleExhibition',
    display_name: 'Single Exhibition',
    schema: {
      heading: {
        type: 'text',
        display_name: 'Heading',
        description: 'Exhibition title',
        required: true
      },
      description: {
        type: 'richtext',
        display_name: 'Description',
        description: 'Exhibition description',
        required: false
      },
      location: {
        type: 'text',
        display_name: 'Location',
        description: 'Exhibition venue/location',
        required: false
      },
      featured_image: {
        type: 'asset',
        display_name: 'Featured Image',
        description: 'Main exhibition image',
        required: false,
        filetypes: ['images']
      },
      start_date: {
        type: 'datetime',
        display_name: 'Start Date',
        description: 'Exhibition start date',
        required: false
      },
      end_date: {
        type: 'datetime',
        display_name: 'End Date',
        description: 'Exhibition end date',
        required: false
      },
      type: {
        type: 'option',
        display_name: 'Type',
        description: 'Type of exhibition',
        options: [
          { name: 'Solo', value: 'solo' },
          { name: 'Group', value: 'group' },
          { name: 'Institutional', value: 'institutional' },
          { name: 'Gallery', value: 'gallery' }
        ],
        default_value: 'solo',
        required: false
      }
    },
    is_root: true,
    is_nestable: false,
    component_group_uuid: null,
    color: '#ef4444',
    icon: 'block-calendar'
  }

  return await createComponent(componentData)
}

// SingleHome Component
async function createSingleHome() {
  const componentData = {
    name: 'SingleHome',
    display_name: 'Single Home',
    schema: {
      story_text: {
        type: 'richtext',
        display_name: 'Story Text',
        description: 'Main homepage text content',
        required: false
      },
      content: {
        type: 'bloks',
        display_name: 'Content',
        description: 'Add content blocks',
        restrict_type: 'Content',
        restrict_components: true,
        required: false
      }
    },
    is_root: true,
    is_nestable: false,
    component_group_uuid: null,
    color: '#10b981',
    icon: 'block-home'
  }

  return await createComponent(componentData)
}

// SingleAbout Component
async function createSingleAbout() {
  const componentData = {
    name: 'SingleAbout',
    display_name: 'Single About',
    schema: {
      story_text: {
        type: 'richtext',
        display_name: 'Story Text',
        description: 'About page text content',
        required: false
      },
      content: {
        type: 'bloks',
        display_name: 'Exhibitions',
        description: 'Add related exhibition blocks',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['SingleExhibition'],
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

// Main function to create all components
async function main() {
  try {
    console.log('🚀 Creating page components for Christopher Anderson portfolio...\n')

    console.log('📁 Projects Components:')
    await createIndexProjects()
    await createSingleProject()

    console.log('\n📁 Exhibitions Components:')
    await createIndexExhibition()
    await createSingleExhibition()

    console.log('\n📁 General Page Components:')
    await createSingleHome()
    await createSingleAbout()

    console.log('\n🎉 All page components created successfully!')
    console.log('\nComponent Summary:')
    console.log('📋 IndexProjects - Lists projects with display options')
    console.log('📄 SingleProject - Individual project pages')
    console.log('📋 IndexExhibition - Lists exhibitions')
    console.log('🎭 SingleExhibition - Individual exhibition pages')
    console.log('🏠 SingleHome - Homepage component')
    console.log('👤 SingleAbout - About page component')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()