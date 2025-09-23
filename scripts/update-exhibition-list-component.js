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

async function updateExhibitionListComponent() {
  try {
    console.log('🔄 Updating ExhibitionList component...\n')

    // Get all components to find ExhibitionList
    const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
    if (componentsResponse.status !== 200) {
      throw new Error('Failed to fetch components')
    }

    const components = componentsResponse.data.components
    const exhibitionListComponent = components.find(c => c.name === 'ExhibitionList')

    if (!exhibitionListComponent) {
      throw new Error('ExhibitionList component not found')
    }

    console.log('📋 Current ExhibitionList fields:')
    Object.keys(exhibitionListComponent.schema || {}).forEach(key => {
      const field = exhibitionListComponent.schema[key]
      console.log(`  • ${key}: ${field.type} - ${field.display_name}`)
    })

    // Create new schema with text boxes for exhibitions
    const newSchema = {
      heading: {
        type: 'text',
        display_name: 'Exhibition List Heading',
        description: 'Heading for this exhibition list section',
        required: false
      },
      exhibitions: {
        type: 'bloks',
        display_name: 'Exhibitions',
        description: 'Add individual exhibition text entries',
        required: false,
        restrict_components: true,
        component_whitelist: ['ExhibitionItem']
      }
    }

    // Update the component
    const updateData = {
      component: {
        name: exhibitionListComponent.name,
        display_name: exhibitionListComponent.display_name,
        is_root: exhibitionListComponent.is_root,
        is_nestable: exhibitionListComponent.is_nestable,
        component_group_uuid: exhibitionListComponent.component_group_uuid,
        schema: newSchema
      }
    }

    console.log('\n🔄 Updating ExhibitionList component...')
    const updateResponse = await makeRequest(`spaces/${SPACE_ID}/components/${exhibitionListComponent.id}`, 'PUT', updateData)

    if (updateResponse.status === 200) {
      console.log('✅ ExhibitionList component updated successfully!')
      console.log('\n📋 New fields:')
      console.log('  • heading: text - Exhibition List Heading')
      console.log('  • exhibitions: bloks - Exhibitions (using ExhibitionItem)')
    } else {
      console.error('❌ Failed to update component:', updateResponse.data)
    }

  } catch (error) {
    console.error('❌ Error updating ExhibitionList component:', error.message)
  }
}

// Run the update
updateExhibitionListComponent()