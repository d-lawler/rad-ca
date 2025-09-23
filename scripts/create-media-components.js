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

// ImageCarousel Component
async function createImageCarousel() {
  const componentData = {
    name: 'ImageCarousel',
    display_name: 'Image Carousel',
    schema: {
      images: {
        type: 'bloks',
        display_name: 'Images',
        description: 'Add images to the carousel',
        restrict_type: '',
        restrict_components: true,
        component_whitelist: ['Asset'],
        required: true
      },
      autoplay: {
        type: 'boolean',
        display_name: 'Auto-play',
        description: 'Enable automatic slideshow',
        default_value: false,
        required: false
      },
      autoplay_interval: {
        type: 'number',
        display_name: 'Auto-play Interval (ms)',
        description: 'Time between slides in milliseconds',
        default_value: 5000,
        required: false
      },
      show_dots: {
        type: 'boolean',
        display_name: 'Show Dots',
        description: 'Show navigation dots below carousel',
        default_value: true,
        required: false
      }
    },
    is_root: false,
    is_nestable: true,
    component_group_uuid: null,
    color: '#06b6d4',
    icon: 'block-image'
  }

  return await createComponent(componentData)
}

// VideoPlayer Component
async function createVideoPlayer() {
  const componentData = {
    name: 'VideoPlayer',
    display_name: 'Video Player (Vimeo)',
    schema: {
      vimeo_url: {
        type: 'text',
        display_name: 'Vimeo URL',
        description: 'Enter the Vimeo video URL (e.g., https://vimeo.com/123456)',
        required: true
      },
      video_cover: {
        type: 'asset',
        display_name: 'Video Cover/Thumbnail',
        description: 'Upload a video file to loop as preview (autoplay muted)',
        required: false,
        filetypes: ['videos']
      },
      poster_image: {
        type: 'asset',
        display_name: 'Poster Image',
        description: 'Fallback image if video cover fails to load',
        required: false,
        filetypes: ['images']
      },
      title: {
        type: 'text',
        display_name: 'Video Title',
        description: 'Title for accessibility (optional)',
        required: false
      },
      caption: {
        type: 'text',
        display_name: 'Caption',
        description: 'Optional caption displayed below the video',
        required: false
      },
      aspect_ratio: {
        type: 'option',
        display_name: 'Aspect Ratio',
        description: 'Video aspect ratio',
        options: [
          { name: '16:9 (Standard)', value: '16-9' },
          { name: '4:3 (Classic)', value: '4-3' },
          { name: '21:9 (Ultrawide)', value: '21-9' },
          { name: '1:1 (Square)', value: '1-1' }
        ],
        default_value: '16-9',
        required: false
      },
      loop: {
        type: 'boolean',
        display_name: 'Loop Full Video',
        description: 'Loop the full Vimeo video when playing',
        default_value: false,
        required: false
      },
      hide_title: {
        type: 'boolean',
        display_name: 'Hide Vimeo Title',
        description: 'Hide the video title in the Vimeo player',
        default_value: false,
        required: false
      },
      hide_byline: {
        type: 'boolean',
        display_name: 'Hide Byline',
        description: 'Hide the byline (author) in the Vimeo player',
        default_value: false,
        required: false
      },
      hide_portrait: {
        type: 'boolean',
        display_name: 'Hide Portrait',
        description: 'Hide the user portrait in the Vimeo player',
        default_value: false,
        required: false
      },
      color: {
        type: 'text',
        display_name: 'Player Color',
        description: 'Hex color for Vimeo player controls (e.g., #ff0000)',
        required: false
      },
      full_width: {
        type: 'boolean',
        display_name: 'Full Width',
        description: 'Extend video to full viewport width',
        default_value: false,
        required: false
      }
    },
    is_root: false,
    is_nestable: true,
    component_group_uuid: null,
    color: '#f59e0b',
    icon: 'block-video'
  }

  return await createComponent(componentData)
}

// Main function to create both components
async function main() {
  try {
    console.log('🚀 Creating media components for Christopher Anderson portfolio...\n')

    console.log('📸 Creating Image Carousel Component:')
    await createImageCarousel()

    console.log('\n🎬 Creating Video Player Component:')
    await createVideoPlayer()

    console.log('\n🎉 All media components created successfully!')
    console.log('\nComponent Summary:')
    console.log('📸 ImageCarousel - Multi-image carousel with navigation and auto-play options')
    console.log('🎬 VideoPlayer - Vimeo video player with extensive customization options')
    console.log('\nThese components can now be added to your Storyblok content!')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()