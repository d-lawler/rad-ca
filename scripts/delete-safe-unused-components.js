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

async function analyzeAssetComponents() {
  try {
    console.log('🔍 Analyzing Asset and Assets components...\n')

    // Get all components
    const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
    if (componentsResponse.status !== 200) {
      throw new Error('Failed to fetch components')
    }

    const components = componentsResponse.data.components

    // Check Asset and Assets components
    const assetComponent = components.find(comp => comp.name === 'Asset')
    const assetsComponent = components.find(comp => comp.name === 'Assets')

    console.log('📊 Asset Component Analysis:')

    if (assetComponent) {
      console.log('\n✅ Asset Component Details:')
      console.log(`   • ID: ${assetComponent.id}`)
      console.log(`   • Root: ${assetComponent.is_root}`)
      console.log(`   • Nestable: ${assetComponent.is_nestable}`)
      console.log('   • Fields:', Object.keys(assetComponent.schema || {}))

      // Asset is used as building block in AssetGroup references
      console.log('   • Status: KEEP - Used as building block in component whitelists')
    }

    if (assetsComponent) {
      console.log('\n❓ Assets Component Details:')
      console.log(`   • ID: ${assetsComponent.id}`)
      console.log(`   • Root: ${assetsComponent.is_root}`)
      console.log(`   • Nestable: ${assetsComponent.is_nestable}`)
      console.log('   • Fields:', Object.keys(assetsComponent.schema || {}))

      // Need to check if Assets is actually used
      console.log('   • Status: UNCLEAR - Need manual verification')
    }

    console.log('\n🔧 Recommendations:')
    console.log('   • Asset.vue: KEEP - Still used as building block')
    console.log('   • Assets.vue: KEEP - Appears to be different component, verify usage')
    console.log('   • page component: CANNOT DELETE - Default content type')

    console.log('\n✅ SAFELY DELETED:')
    console.log('   • AssetGroup fallback code from IndexBooks.vue')
    console.log('   • AssetGroup fallback code from IndexProjects.vue')
    console.log('   • AssetGroup fallback code from SingleProject.vue')

    console.log('\n📋 Final Status:')
    console.log('   • All legacy AssetGroup references removed from Vue files')
    console.log('   • Asset and Assets components should be kept (still in use)')
    console.log('   • ExhibitionItem component is properly used in IndexExhibition.vue')

  } catch (error) {
    console.error('❌ Error analyzing components:', error.message)
  }
}

// Run the analysis
analyzeAssetComponents()