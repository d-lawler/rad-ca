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

async function deleteUnusedComponents() {
  try {
    console.log('🗑️  Deleting unused CMS components...\n')

    // Get all components
    const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
    if (componentsResponse.status !== 200) {
      throw new Error('Failed to fetch components')
    }

    const components = componentsResponse.data.components

    // Components identified as unused
    const componentsToDelete = [
      'page' // Lowercase 'page' component - we have Page.vue with capital P
    ]

    console.log('📋 Components marked for deletion:')
    componentsToDelete.forEach(name => {
      console.log(`   • ${name}`)
    })

    // Find and delete each component
    for (const componentName of componentsToDelete) {
      const component = components.find(comp => comp.name === componentName)

      if (!component) {
        console.log(`\n⚠️  Component '${componentName}' not found in CMS`)
        continue
      }

      console.log(`\n🗑️  Deleting component: ${componentName}`)
      console.log(`   ID: ${component.id}`)

      const deleteResponse = await makeRequest(`spaces/${SPACE_ID}/components/${component.id}`, 'DELETE')

      if (deleteResponse.status === 200 || deleteResponse.status === 204) {
        console.log(`   ✅ Successfully deleted '${componentName}'`)
      } else {
        console.log(`   ❌ Failed to delete '${componentName}':`, deleteResponse.data)
      }
    }

    console.log('\n🎉 Component cleanup complete!')

    console.log('\n📋 Summary:')
    console.log(`   • Components targeted for deletion: ${componentsToDelete.length}`)

    console.log('\n⚠️  REMAINING ISSUES TO ADDRESS:')
    console.log('   • ExhibitionItem - Used in IndexExhibition.vue but no Vue file exists')
    console.log('     → Either create ExhibitionItem.vue or update IndexExhibition.vue')
    console.log('   • Page vs page - Page.vue exists but CMS has lowercase "page"')
    console.log('     → Storyblok component names should match Vue filenames exactly')

    console.log('\n🔧 RECOMMENDED NEXT STEPS:')
    console.log('   1. Create missing Vue files:')
    console.log('      - ExhibitionItem.vue (if needed)')
    console.log('   2. Register Page.vue properly in CMS with correct casing')
    console.log('   3. Remove AssetGroup fallback code since AssetGroup no longer exists in CMS')

  } catch (error) {
    console.error('❌ Error deleting components:', error.message)
  }
}

// Run the script
deleteUnusedComponents()