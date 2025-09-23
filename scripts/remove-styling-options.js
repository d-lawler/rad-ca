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

async function removeStylingOptions() {
  try {
    console.log('🎨 Removing styling options from IndexProjects and IndexBooks...\n')

    // Get existing components
    const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
    if (componentsResponse.status !== 200) {
      throw new Error('Failed to fetch components')
    }

    const components = componentsResponse.data.components

    // 1. Update IndexBooks - remove list_type and thumbnail_type
    console.log('1️⃣ Updating IndexBooks...')
    const indexBooksComponent = components.find(comp => comp.name === 'IndexBooks')

    if (!indexBooksComponent) {
      console.log('   ❌ IndexBooks component not found')
    } else {
      // Create schema without list_type and thumbnail_type
      const cleanedBooksSchema = { ...indexBooksComponent.schema }
      delete cleanedBooksSchema.list_type
      delete cleanedBooksSchema.thumbnail_type

      const booksUpdateData = {
        component: {
          name: indexBooksComponent.name,
          display_name: indexBooksComponent.display_name,
          is_root: indexBooksComponent.is_root,
          is_nestable: indexBooksComponent.is_nestable,
          component_group_uuid: indexBooksComponent.component_group_uuid,
          schema: cleanedBooksSchema
        }
      }

      const booksResponse = await makeRequest(`spaces/${SPACE_ID}/components/${indexBooksComponent.id}`, 'PUT', booksUpdateData)
      if (booksResponse.status === 200) {
        console.log('   ✅ IndexBooks updated - styling options removed')
      } else {
        console.log('   ❌ Error updating IndexBooks:', booksResponse.data)
      }
    }

    // 2. Update IndexProjects - remove list_type and thumbnail_type
    console.log('2️⃣ Updating IndexProjects...')
    const indexProjectsComponent = components.find(comp => comp.name === 'IndexProjects')

    if (!indexProjectsComponent) {
      console.log('   ❌ IndexProjects component not found')
    } else {
      // Create schema without list_type and thumbnail_type
      const cleanedProjectsSchema = { ...indexProjectsComponent.schema }
      delete cleanedProjectsSchema.list_type
      delete cleanedProjectsSchema.thumbnail_type

      const projectsUpdateData = {
        component: {
          name: indexProjectsComponent.name,
          display_name: indexProjectsComponent.display_name,
          is_root: indexProjectsComponent.is_root,
          is_nestable: indexProjectsComponent.is_nestable,
          component_group_uuid: indexProjectsComponent.component_group_uuid,
          schema: cleanedProjectsSchema
        }
      }

      const projectsResponse = await makeRequest(`spaces/${SPACE_ID}/components/${indexProjectsComponent.id}`, 'PUT', projectsUpdateData)
      if (projectsResponse.status === 200) {
        console.log('   ✅ IndexProjects updated - styling options removed')
      } else {
        console.log('   ❌ Error updating IndexProjects:', projectsResponse.data)
      }
    }

    console.log('\n🎉 Styling options removal complete!')
    console.log('\n📋 Changes made:')
    console.log('   • Removed list_type field from IndexBooks')
    console.log('   • Removed thumbnail_type field from IndexBooks')
    console.log('   • Removed list_type field from IndexProjects')
    console.log('   • Removed thumbnail_type field from IndexProjects')

    console.log('\n🎨 Fixed styling:')
    console.log('   • Books: Large text, thumbnails below')
    console.log('   • Projects: Small text, thumbnails above')

    console.log('\n📝 Next steps:')
    console.log('   • Vue components will be updated with hardcoded styles')
    console.log('   • No more configuration needed in CMS')

  } catch (error) {
    console.error('❌ Error removing styling options:', error.message)
  }
}

// Run the script
removeStylingOptions()