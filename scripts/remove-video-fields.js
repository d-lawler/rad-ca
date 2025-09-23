const https = require('https')

const SPACE_ID = 287057443149790 // Christopher Anderson space

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

async function removeVideoFields() {
  try {
    console.log('🚀 Removing featured_video fields from Book and Project content types...\n')

    // Get existing components
    const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
    if (componentsResponse.status !== 200) {
      throw new Error('Failed to fetch components')
    }

    const components = componentsResponse.data.components

    // 1. Update SingleBook content type
    console.log('1️⃣ Updating SingleBook content type...')
    const singleBookComponent = components.find(comp => comp.name === 'SingleBook')

    if (!singleBookComponent) {
      console.log('   ⚠️  SingleBook component not found')
    } else {
      // Remove featured_video from schema
      const updatedBookSchema = { ...singleBookComponent.schema }
      delete updatedBookSchema.featured_video

      const bookUpdateData = {
        component: {
          name: singleBookComponent.name,
          display_name: singleBookComponent.display_name,
          is_root: singleBookComponent.is_root,
          is_nestable: singleBookComponent.is_nestable,
          component_group_uuid: singleBookComponent.component_group_uuid,
          schema: updatedBookSchema
        }
      }

      const bookResponse = await makeRequest(`spaces/${SPACE_ID}/components/${singleBookComponent.id}`, 'PUT', bookUpdateData)
      if (bookResponse.status === 200) {
        console.log('   ✅ SingleBook updated - featured_video field removed')
      } else {
        console.log('   ❌ Error updating SingleBook:', bookResponse.data)
      }
    }

    // 2. Update SingleProject content type (if it exists)
    console.log('2️⃣ Updating SingleProject content type...')
    const singleProjectComponent = components.find(comp => comp.name === 'SingleProject')

    if (!singleProjectComponent) {
      console.log('   ⚠️  SingleProject component not found')
    } else {
      // Remove featured_video from schema
      const updatedProjectSchema = { ...singleProjectComponent.schema }
      delete updatedProjectSchema.featured_video

      const projectUpdateData = {
        component: {
          name: singleProjectComponent.name,
          display_name: singleProjectComponent.display_name,
          is_root: singleProjectComponent.is_root,
          is_nestable: singleProjectComponent.is_nestable,
          component_group_uuid: singleProjectComponent.component_group_uuid,
          schema: updatedProjectSchema
        }
      }

      const projectResponse = await makeRequest(`spaces/${SPACE_ID}/components/${singleProjectComponent.id}`, 'PUT', projectUpdateData)
      if (projectResponse.status === 200) {
        console.log('   ✅ SingleProject updated - featured_video field removed')
      } else {
        console.log('   ❌ Error updating SingleProject:', projectResponse.data)
      }
    }

    console.log('\n🎉 Video fields removal complete!')
    console.log('\n📋 Changes made:')
    console.log('   • Removed featured_video field from SingleBook')
    console.log('   • Removed featured_video field from SingleProject')

    console.log('\n📝 Next steps:')
    console.log('   • Vue components will be updated to remove video handling')
    console.log('   • Only featured_image field will be used for cover media')

  } catch (error) {
    console.error('❌ Error removing video fields:', error.message)
  }
}

// Run the script
removeVideoFields()