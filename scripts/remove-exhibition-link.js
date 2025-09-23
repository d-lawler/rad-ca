const https = require('https')

const SPACE_ID = 287057443149790

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'mapi.storyblok.com',
      port: 443,
      path: '/v1/' + path,
      method: method,
      headers: {
        'Authorization': process.env.STORYBLOK_MANAGEMENT_TOKEN,
        'Content-Type': 'application/json'
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      res.on('data', (chunk) => responseData += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          resolve({ status: res.statusCode, data: parsed })
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData })
        }
      })
    })

    req.on('error', reject)

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function removeExhibitionLink() {
  try {
    console.log('🔄 Removing Exhibition Link field from ExhibitionItem...\n')

    // Get all components to find ExhibitionItem
    const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
    if (componentsResponse.status !== 200) {
      throw new Error('Failed to fetch components')
    }

    const components = componentsResponse.data.components
    const exhibitionItemComponent = components.find(c => c.name === 'ExhibitionItem')

    if (!exhibitionItemComponent) {
      throw new Error('ExhibitionItem component not found')
    }

    console.log('📋 Current ExhibitionItem fields:')
    Object.keys(exhibitionItemComponent.schema || {}).forEach(key => {
      const field = exhibitionItemComponent.schema[key]
      console.log(`  • ${key}: ${field.type} - ${field.display_name}`)
    })

    // Update schema to only have text field (remove link field)
    const newSchema = {
      text: {
        type: 'textarea',
        display_name: 'Exhibition Text',
        description: 'Text content for this exhibition entry',
        required: true
      }
    }

    const updateData = {
      component: {
        name: exhibitionItemComponent.name,
        display_name: exhibitionItemComponent.display_name,
        is_root: exhibitionItemComponent.is_root,
        is_nestable: exhibitionItemComponent.is_nestable,
        component_group_uuid: exhibitionItemComponent.component_group_uuid,
        schema: newSchema
      }
    }

    console.log('\n🔄 Updating ExhibitionItem component...')
    const updateResponse = await makeRequest(`spaces/${SPACE_ID}/components/${exhibitionItemComponent.id}`, 'PUT', updateData)

    if (updateResponse.status === 200) {
      console.log('✅ ExhibitionItem component updated successfully!')
      console.log('\n📋 New fields:')
      console.log('  • text: textarea - Exhibition Text')
      console.log('\n📝 Exhibition Link field has been removed')
    } else {
      console.error('❌ Failed to update component:', updateResponse.data)
    }

  } catch (error) {
    console.error('❌ Error removing Exhibition Link field:', error.message)
  }
}

// Run the update
removeExhibitionLink()