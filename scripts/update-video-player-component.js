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

async function getComponentId(componentName) {
  const SPACE_ID = await getSpaceId()

  const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/components`, {
    headers: {
      'Authorization': MANAGEMENT_TOKEN
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get components: ${response.status}`)
  }

  const data = await response.json()
  const component = data.components.find(comp => comp.name === componentName)

  return component?.id
}

async function updateComponent(componentId, componentData) {
  const SPACE_ID = await getSpaceId()

  try {
    const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/components/${componentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ component: componentData })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update component: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log(`✅ ${componentData.name} updated successfully!`)
    console.log('Component ID:', result.component.id)

    return result
  } catch (error) {
    console.error(`❌ Error updating ${componentData.name}:`, error.message)
    throw error
  }
}

// Update VideoPlayer Component with new fields
async function updateVideoPlayer() {
  const componentId = await getComponentId('VideoPlayer')

  if (!componentId) {
    throw new Error('VideoPlayer component not found')
  }

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

  return await updateComponent(componentId, componentData)
}

// Main function
async function main() {
  try {
    console.log('🚀 Updating VideoPlayer component with new preview functionality...\n')

    await updateVideoPlayer()

    console.log('\n🎉 VideoPlayer component updated successfully!')
    console.log('\nNew Features Added:')
    console.log('📹 Video Cover/Thumbnail - Upload a video to autoplay as preview')
    console.log('🖼️ Poster Image - Fallback image for video preview')
    console.log('▶️ Click-to-play functionality with full Vimeo controls')
    console.log('\nThe component now supports a much more engaging video experience!')

  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

main()