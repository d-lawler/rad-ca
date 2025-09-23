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

async function updateSimplePreview(spaceId) {
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

  // Simple preview template - just show first image
  const simplePreviewTemplate = `
{{#if images}}
  {{#with images.[0]}}
    <img src="{{filename}}/m/300x200/smart" style="width: 100%; max-width: 300px; height: auto; border-radius: 4px;" alt="Preview">
  {{/with}}
  {{#if (gt images.length 1)}}
    <p style="font-size: 12px; color: #666; margin-top: 8px;">+ {{subtract images.length 1}} more item{{#unless (eq images.length 2)}}s{{/unless}}</p>
  {{/if}}
{{else}}
  <p style="color: #999; font-style: italic;">No images added</p>
{{/if}}
  `.trim()

  // Updated component with simple preview template
  const updatedComponent = {
    ...assetGroupComponent,
    preview_tmpl: simplePreviewTemplate
  }

  // Update component
  const updateResponse = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/components/${assetGroupComponent.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ component: updatedComponent })
  })

  if (!updateResponse.ok) {
    const error = await updateResponse.text()
    throw new Error(`Failed to update AssetGroup: ${updateResponse.status} - ${error}`)
  }

  console.log('✅ AssetGroup preview template updated to simple version')
  return await updateResponse.json()
}

async function main() {
  try {
    console.log('🚀 Updating AssetGroup preview template to simple version...\n')

    const spaceId = await getSpaceId()
    await updateSimplePreview(spaceId)

    console.log('\n🎉 Preview template successfully updated!')
    console.log('\nNew preview features:')
    console.log('- Shows first image as preview thumbnail')
    console.log('- Displays count of additional items (if any)')
    console.log('- Simple, clean syntax')
    console.log('- Fallback message when no images added')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  }
}

main()