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

async function updateExhibitionComponents() {
  try {
    console.log('🔄 Updating Exhibition components...\n')

    // Get all components
    const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
    if (componentsResponse.status !== 200) {
      throw new Error('Failed to fetch components')
    }

    const components = componentsResponse.data.components
    const exhibitionListComponent = components.find(c => c.name === 'ExhibitionList')
    const exhibitionItemComponent = components.find(c => c.name === 'ExhibitionItem')

    if (!exhibitionListComponent) {
      throw new Error('ExhibitionList component not found')
    }

    if (!exhibitionItemComponent) {
      throw new Error('ExhibitionItem component not found')
    }

    // 1. Update ExhibitionItem to use text fields
    console.log('1️⃣ Updating ExhibitionItem component...')

    const exhibitionItemSchema = {
      text: {
        type: 'textarea',
        display_name: 'Exhibition Text',
        description: 'Text content for this exhibition entry',
        required: true
      },
      link: {
        type: 'link',
        display_name: 'Exhibition Link',
        description: 'Optional link to exhibition page or external URL',
        required: false
      }
    }

    const exhibitionItemUpdateData = {
      component: {
        name: exhibitionItemComponent.name,
        display_name: exhibitionItemComponent.display_name,
        is_root: exhibitionItemComponent.is_root,
        is_nestable: exhibitionItemComponent.is_nestable,
        component_group_uuid: exhibitionItemComponent.component_group_uuid,
        schema: exhibitionItemSchema
      }
    }

    const itemUpdateResponse = await makeRequest(`spaces/${SPACE_ID}/components/${exhibitionItemComponent.id}`, 'PUT', exhibitionItemUpdateData)

    if (itemUpdateResponse.status === 200) {
      console.log('   ✅ ExhibitionItem updated with text fields')
    } else {
      console.log('   ❌ Error updating ExhibitionItem:', itemUpdateResponse.data)
      return
    }

    // 2. Update ExhibitionList to use bloks instead of options
    console.log('2️⃣ Updating ExhibitionList component...')

    const exhibitionListSchema = {
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

    const exhibitionListUpdateData = {
      component: {
        name: exhibitionListComponent.name,
        display_name: exhibitionListComponent.display_name,
        is_root: exhibitionListComponent.is_root,
        is_nestable: exhibitionListComponent.is_nestable,
        component_group_uuid: exhibitionListComponent.component_group_uuid,
        schema: exhibitionListSchema
      }
    }

    const listUpdateResponse = await makeRequest(`spaces/${SPACE_ID}/components/${exhibitionListComponent.id}`, 'PUT', exhibitionListUpdateData)

    if (listUpdateResponse.status === 200) {
      console.log('   ✅ ExhibitionList updated with bloks field')
    } else {
      console.log('   ❌ Error updating ExhibitionList:', listUpdateResponse.data)
      return
    }

    console.log('\n🎉 Exhibition components updated successfully!')
    console.log('\n📋 New structure:')
    console.log('ExhibitionList:')
    console.log('   • heading (text) - Exhibition List Heading')
    console.log('   • exhibitions (bloks) - Exhibition entries using ExhibitionItem')
    console.log('')
    console.log('ExhibitionItem:')
    console.log('   • text (textarea) - Exhibition Text')
    console.log('   • link (url) - Exhibition Link (optional)')

    console.log('\n📝 Usage:')
    console.log('   • Add multiple ExhibitionList components to homepage')
    console.log('   • Each list can have its own heading')
    console.log('   • Each list can contain multiple ExhibitionItem text boxes')
    console.log('   • Each exhibition text can optionally link somewhere')

  } catch (error) {
    console.error('❌ Error updating components:', error.message)
  }
}

// Run the update
updateExhibitionComponents()