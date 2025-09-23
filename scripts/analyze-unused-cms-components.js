const https = require('https')
const fs = require('fs')
const path = require('path')

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

// Get all Vue files in storyblok directory
function getVueComponents() {
  const storyblokDir = path.join(__dirname, '../storyblok')
  const files = fs.readdirSync(storyblokDir)
  return files
    .filter(file => file.endsWith('.vue'))
    .map(file => path.basename(file, '.vue'))
}

// Scan files for component usage
function scanFileForComponents(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const componentRefs = new Set()

    // Look for component="ComponentName" patterns
    const componentMatches = content.match(/component\s*===?\s*['"`]([^'"`]+)['"`]/g)
    if (componentMatches) {
      componentMatches.forEach(match => {
        const component = match.match(/['"`]([^'"`]+)['"`]/)[1]
        componentRefs.add(component)
      })
    }

    // Look for component_whitelist arrays
    const whitelistMatches = content.match(/component_whitelist\s*:\s*\[([^\]]+)\]/g)
    if (whitelistMatches) {
      whitelistMatches.forEach(match => {
        const components = match.match(/'([^']+)'/g)
        if (components) {
          components.forEach(comp => {
            componentRefs.add(comp.replace(/'/g, ''))
          })
        }
      })
    }

    // Look for filter_content_type arrays
    const filterMatches = content.match(/filter_content_type\s*:\s*\[([^\]]+)\]/g)
    if (filterMatches) {
      filterMatches.forEach(match => {
        const components = match.match(/'([^']+)'/g)
        if (components) {
          components.forEach(comp => {
            componentRefs.add(comp.replace(/'/g, ''))
          })
        }
      })
    }

    return Array.from(componentRefs)
  } catch (error) {
    return []
  }
}

async function analyzeUnusedComponents() {
  try {
    console.log('🔍 Analyzing unused CMS components...\n')

    // Get all components from CMS
    const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
    if (componentsResponse.status !== 200) {
      throw new Error('Failed to fetch components')
    }

    const cmsComponents = componentsResponse.data.components.map(comp => comp.name)

    // Get Vue components in codebase
    const vueComponents = getVueComponents()

    // Scan all files for component references
    const usedComponents = new Set()

    // Scan Vue files
    const storyblokDir = path.join(__dirname, '../storyblok')
    vueComponents.forEach(comp => {
      const filePath = path.join(storyblokDir, `${comp}.vue`)
      const refs = scanFileForComponents(filePath)
      refs.forEach(ref => usedComponents.add(ref))
      // Vue file existence implies the component is used
      usedComponents.add(comp)
    })

    // Scan script files
    const scriptsDir = __dirname
    const scriptFiles = fs.readdirSync(scriptsDir).filter(file => file.endsWith('.js'))
    scriptFiles.forEach(file => {
      const filePath = path.join(scriptsDir, file)
      const refs = scanFileForComponents(filePath)
      refs.forEach(ref => usedComponents.add(ref))
    })

    // Manual check for specific patterns
    console.log('📊 Component Analysis:\n')

    console.log('✅ USED Components:')
    const usedCmsComponents = cmsComponents.filter(comp => usedComponents.has(comp))
    usedCmsComponents.sort().forEach(comp => {
      console.log(`   • ${comp}`)
    })

    console.log('\n❌ POTENTIALLY UNUSED Components:')
    const unusedComponents = cmsComponents.filter(comp => !usedComponents.has(comp))
    unusedComponents.sort().forEach(comp => {
      console.log(`   • ${comp}`)
    })

    console.log('\n🔍 Vue Files in Codebase:')
    vueComponents.sort().forEach(comp => {
      console.log(`   • ${comp}.vue`)
    })

    console.log('\n📋 Summary:')
    console.log(`   • Total CMS Components: ${cmsComponents.length}`)
    console.log(`   • Used Components: ${usedCmsComponents.length}`)
    console.log(`   • Potentially Unused: ${unusedComponents.length}`)
    console.log(`   • Vue Files: ${vueComponents.length}`)

    // Additional detailed analysis
    console.log('\n🔍 Detailed Analysis:')

    // Check for components that exist in CMS but not as Vue files
    const missingVueFiles = cmsComponents.filter(comp => !vueComponents.includes(comp))
    if (missingVueFiles.length > 0) {
      console.log('\n⚠️  CMS Components WITHOUT Vue Files:')
      missingVueFiles.forEach(comp => {
        console.log(`   • ${comp} - CMS component exists but no ${comp}.vue file`)
      })
    }

    // Check for Vue files that might not be registered in CMS
    const unregisteredVueFiles = vueComponents.filter(comp => !cmsComponents.includes(comp))
    if (unregisteredVueFiles.length > 0) {
      console.log('\n📝 Vue Files NOT in CMS:')
      unregisteredVueFiles.forEach(comp => {
        console.log(`   • ${comp}.vue - Vue file exists but not registered in CMS`)
      })
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      cmsComponents,
      vueComponents,
      usedComponents: Array.from(usedComponents),
      unusedComponents,
      missingVueFiles,
      unregisteredVueFiles
    }

    fs.writeFileSync(
      path.join(__dirname, 'component-analysis-report.json'),
      JSON.stringify(report, null, 2)
    )

    console.log('\n💾 Detailed report saved to: scripts/component-analysis-report.json')

    if (unusedComponents.length > 0) {
      console.log('\n🗑️  SAFE TO DELETE (if confirmed unused):')
      unusedComponents.forEach(comp => {
        console.log(`   • ${comp}`)
      })

      console.log('\n⚠️  BEFORE DELETING:')
      console.log('   1. Double-check each component is truly unused')
      console.log('   2. Search codebase manually for any dynamic references')
      console.log('   3. Check if components are used in existing content/stories')
      console.log('   4. Make sure no external integrations reference them')
    }

  } catch (error) {
    console.error('❌ Error analyzing components:', error.message)
  }
}

// Run the analysis
analyzeUnusedComponents()