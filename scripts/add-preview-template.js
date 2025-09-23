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

async function addPreviewTemplate(spaceId) {
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

  console.log('Current AssetGroup component:', JSON.stringify(assetGroupComponent, null, 2))

  // Updated component with preview template
  const updatedComponent = {
    ...assetGroupComponent,
    preview_tmpl: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e1e5e9;">
        <div style="font-weight: 600; color: #1b243f; width: 100%; margin-bottom: 8px; font-size: 14px;">
          📁 Asset Group ({{ alignment | default: "center" | capitalize }})
        </div>

        {% if images %}
          {% for image in images limit: 6 %}
            <div style="width: 60px; height: 60px; border-radius: 4px; overflow: hidden; background: #fff; border: 1px solid #ddd;">
              {% if image.filename contains '.mp4' or image.filename contains '.webm' or image.filename contains '.mov' %}
                <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
                  ▶️
                </div>
              {% else %}
                <img src="{{ image.filename }}/m/60x60/smart" style="width: 100%; height: 100%; object-fit: cover;" alt="Preview">
              {% endif %}
            </div>
          {% endfor %}

          {% assign remaining = images.size | minus: 6 %}
          {% if remaining > 0 %}
            <div style="width: 60px; height: 60px; border-radius: 4px; background: #f1f3f4; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #5f6368; font-weight: 500;">
              +{{ remaining }}
            </div>
          {% endif %}

          <div style="width: 100%; font-size: 12px; color: #5f6368; margin-top: 8px;">
            {{ images.size }} item{% if images.size != 1 %}s{% endif %}
          </div>
        {% else %}
          <div style="width: 100%; text-align: center; color: #9aa0a6; font-size: 12px; padding: 20px;">
            No media files added yet
          </div>
        {% endif %}
      </div>
    `.trim()
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

  console.log('✅ AssetGroup preview template added successfully')
  return await updateResponse.json()
}

async function main() {
  try {
    console.log('🚀 Adding preview template to AssetGroup...\n')

    const spaceId = await getSpaceId()
    await addPreviewTemplate(spaceId)

    console.log('\n🎉 Preview template successfully added!')
    console.log('\nFeatures:')
    console.log('- Shows thumbnail grid of first 6 media files')
    console.log('- Displays video icon for video files')
    console.log('- Shows "+X" counter for additional files')
    console.log('- Displays total item count and alignment')
    console.log('- Clean, modern design matching Storyblok UI')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  }
}

main()