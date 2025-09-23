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

async function pushCompleteAssetGroup(spaceId) {
  // Get current AssetGroup component
  const getResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components`, {
    headers: {
      'Authorization': MANAGEMENT_TOKEN
    }
  })

  const data = await getResponse.json()
  const assetGroupComponent = data.components.find(comp => comp.name === 'AssetGroup')

  if (!assetGroupComponent) {
    throw new Error('AssetGroup component not found')
  }

  // Complete AssetGroup configuration
  const completeAssetGroupConfig = {
    ...assetGroupComponent,
    schema: {
      images: {
        type: 'multiasset',
        display_name: 'Images & Videos',
        description: 'Upload multiple images and videos for this group',
        required: false,
        filetypes: ['images', 'videos'],
        maximum: 50
      },
      alignment: {
        type: 'option',
        display_name: 'Alignment',
        options: [
          { name: 'Left', value: 'left' },
          { name: 'Center', value: 'center' },
          { name: 'Right', value: 'right' }
        ],
        default_value: 'center',
        required: false
      },
      size: {
        type: 'option',
        display_name: 'Size',
        options: [
          { name: 'Large', value: 'large' },
          { name: 'Medium', value: 'medium' },
          { name: 'Small', value: 'small' }
        ],
        required: false
      }
    },
    preview_tmpl: '{{#if images}}{{#with images.[0]}}<img src="{{filename}}/m/300x200/smart" style="width: 100%; max-width: 300px; height: auto; border-radius: 4px;" alt="Preview">{{/with}}{{#if (gt images.length 1)}}<p style="font-size: 12px; color: #666; margin-top: 8px;">+ {{subtract images.length 1}} more item{{#unless (eq images.length 2)}}s{{/unless}}</p>{{/if}}{{else}}<p style="color: #999; font-style: italic;">No images added</p>{{/if}}',
    color: '#2563eb',
    icon: 'block-image-text'
  }

  console.log('📋 Complete AssetGroup configuration:')
  console.log(JSON.stringify(completeAssetGroupConfig, null, 2))

  // Push complete configuration to CMS
  const updateResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components/${assetGroupComponent.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ component: completeAssetGroupConfig })
  })

  if (!updateResponse.ok) {
    const error = await updateResponse.text()
    throw new Error(`Failed to push AssetGroup config: ${updateResponse.status} - ${error}`)
  }

  const result = await updateResponse.json()
  console.log('✅ Complete AssetGroup configuration pushed to CMS successfully')
  return result
}

async function main() {
  try {
    console.log('🚀 Pushing complete AssetGroup configuration to CMS...\n')

    const spaceId = await getSpaceId()
    await pushCompleteAssetGroup(spaceId)

    console.log('\n🎉 Complete AssetGroup configuration successfully pushed!')
    console.log('\nFinal CMS configuration includes:')
    console.log('✅ Multi-asset field (images & videos, up to 50 items)')
    console.log('✅ Optional alignment (left/center/right, defaults to center)')
    console.log('✅ Optional size (large/medium/small, no default)')
    console.log('✅ Simple preview template showing first image + count')
    console.log('✅ Blue color theme with image-text icon')
    console.log('\nAssetGroup is ready for content creation in Storyblok!')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  }
}

main()