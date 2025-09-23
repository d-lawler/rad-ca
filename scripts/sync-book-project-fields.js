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

async function syncBookProjectFields() {
  try {
    console.log('🔄 Syncing SingleProject fields to match SingleBook...\n')

    // Get existing components
    const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
    if (componentsResponse.status !== 200) {
      throw new Error('Failed to fetch components')
    }

    const components = componentsResponse.data.components
    const singleProjectComponent = components.find(comp => comp.name === 'SingleProject')

    if (!singleProjectComponent) {
      console.log('❌ SingleProject component not found')
      return
    }

    // Define the standardized schema that both should have
    const standardizedSchema = {
      name: {
        type: 'text',
        display_name: 'Title',
        description: 'The title of the item',
        required: true
      },
      featured_image: {
        type: 'asset',
        display_name: 'Featured Image',
        description: 'Main cover image',
        required: false,
        filetypes: ['images']
      },
      content: {
        type: 'bloks',
        display_name: 'Content',
        description: 'Add image rows and content blocks',
        required: false,
        restrict_components: true,
        component_whitelist: ['ImageRow', 'ImageGridGroup', 'AssetGroup']
      },
      story_text: {
        type: 'richtext',
        display_name: 'Description',
        description: 'Rich text description',
        required: false,
        toolbar: ['bold', 'italic', 'strike', 'underline', 'code', 'link']
      }
    }

    // Update SingleProject
    console.log('1️⃣ Updating SingleProject to match SingleBook...')
    const projectUpdateData = {
      component: {
        name: singleProjectComponent.name,
        display_name: singleProjectComponent.display_name,
        is_root: singleProjectComponent.is_root,
        is_nestable: singleProjectComponent.is_nestable,
        component_group_uuid: singleProjectComponent.component_group_uuid,
        schema: standardizedSchema
      }
    }

    const projectResponse = await makeRequest(`spaces/${SPACE_ID}/components/${singleProjectComponent.id}`, 'PUT', projectUpdateData)
    if (projectResponse.status === 200) {
      console.log('   ✅ SingleProject updated with matching fields')
    } else {
      console.log('   ❌ Error updating SingleProject:', projectResponse.data)
      return
    }

    // Update SingleBook to use the same standardized schema
    console.log('2️⃣ Updating SingleBook to use standardized field names...')
    const singleBookComponent = components.find(comp => comp.name === 'SingleBook')

    if (!singleBookComponent) {
      console.log('   ❌ SingleBook component not found')
      return
    }

    const bookUpdateData = {
      component: {
        name: singleBookComponent.name,
        display_name: singleBookComponent.display_name,
        is_root: singleBookComponent.is_root,
        is_nestable: singleBookComponent.is_nestable,
        component_group_uuid: singleBookComponent.component_group_uuid,
        schema: standardizedSchema
      }
    }

    const bookResponse = await makeRequest(`spaces/${SPACE_ID}/components/${singleBookComponent.id}`, 'PUT', bookUpdateData)
    if (bookResponse.status === 200) {
      console.log('   ✅ SingleBook updated with standardized fields')
    } else {
      console.log('   ❌ Error updating SingleBook:', bookResponse.data)
    }

    console.log('\n🎉 Field synchronization complete!')
    console.log('\n📋 Both content types now have identical fields:')
    console.log('   • name (text) - Title')
    console.log('   • featured_image (asset) - Featured Image')
    console.log('   • content (blocks) - Content')
    console.log('   • story_text (richtext) - Description')

    console.log('\n📝 Benefits:')
    console.log('   • Consistent field structure across books and projects')
    console.log('   • Same Vue component templates can be used')
    console.log('   • Easier content management')

  } catch (error) {
    console.error('❌ Error syncing fields:', error.message)
  }
}

// Run the script
syncBookProjectFields()