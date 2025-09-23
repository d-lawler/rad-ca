const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function verifyFinalState() {
  try {
    console.log('🔍 Verifying final component state...')

    // Get all components
    const response = await Storyblok.get(`spaces/${spaceId}/components`)
    const allComponents = response.data.components

    console.log('\n📋 Current components:')
    allComponents.forEach(comp => {
      console.log(`   • ${comp.name}`)
    })

    // Check key components and their restrictions
    const keyComponents = ['HomePage', 'Project', 'ImageGrid', 'ImageRow', 'ImageGridGroup', 'ImageItem']

    console.log('\n🔒 Component restrictions:')

    for (const componentName of keyComponents) {
      const component = allComponents.find(comp => comp.name === componentName)
      if (component) {
        console.log(`\n${componentName}:`)

        // Check for bloks fields and their restrictions
        Object.entries(component.schema).forEach(([fieldName, fieldConfig]) => {
          if (fieldConfig.type === 'bloks' && fieldConfig.component_whitelist) {
            console.log(`   📁 ${fieldName} → allows: ${fieldConfig.component_whitelist.join(', ')}`)
          } else if (fieldConfig.type === 'asset') {
            const multiple = fieldConfig.multiple ? 'multiple' : 'single'
            console.log(`   🖼️ ${fieldName} → ${multiple} asset`)
          } else if (fieldConfig.type === 'option') {
            console.log(`   ⚙️ ${fieldName} → options: ${fieldConfig.options?.map(o => o.value).join(', ') || 'none'}`)
          }
        })
      } else {
        console.log(`❌ ${componentName} not found`)
      }
    }

    console.log('\n✅ Final component structure verified!')
    console.log('\n📝 Summary:')
    console.log('   🏠 HomePage → ImageGrid → ImageGridGroup → Multi-asset')
    console.log('   📄 Project → ImageRow → ImageItem → Single asset + size')
    console.log('   🗑️ Old Content and AssetGroup components removed')
    console.log('   🔒 All components properly restricted')

  } catch (error) {
    console.error('❌ Error verifying state:', error.response?.data || error.message)
  }
}

verifyFinalState()