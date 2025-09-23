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

async function fixBooksPage() {
  try {
    console.log('🔧 Fixing Books page setup...\n')

    // Get existing components
    console.log('1️⃣ Checking IndexBooks component...')
    const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
    const components = componentsResponse.data.components
    const indexBooksComponent = components.find(comp => comp.name === 'IndexBooks')

    if (!indexBooksComponent) {
      console.log('   ❌ IndexBooks component not found')
      return
    }

    // Update IndexBooks to be a root component if it isn't already
    if (!indexBooksComponent.is_root) {
      console.log('   🔄 Making IndexBooks a root component...')
      const updateData = {
        component: {
          name: indexBooksComponent.name,
          display_name: indexBooksComponent.display_name,
          is_root: true,
          is_nestable: indexBooksComponent.is_nestable,
          component_group_uuid: indexBooksComponent.component_group_uuid,
          schema: indexBooksComponent.schema
        }
      }

      const response = await makeRequest(`spaces/${SPACE_ID}/components/${indexBooksComponent.id}`, 'PUT', updateData)

      if (response.status === 200) {
        console.log('   ✅ IndexBooks is now a root component')
      } else {
        console.log('   ❌ Error updating component:', response.data)
        return
      }
    } else {
      console.log('   ✅ IndexBooks is already a root component')
    }

    // Check if books page already exists
    console.log('2️⃣ Checking if Books page exists...')
    const storiesResponse = await makeRequest(`spaces/${SPACE_ID}/stories`)
    const stories = storiesResponse.data.stories
    const booksStory = stories.find(story => story.slug === 'books')

    if (booksStory) {
      console.log('   ✅ Books page already exists')
      console.log(`   📄 Story ID: ${booksStory.id}`)
      console.log(`   🔗 Slug: /${booksStory.slug}`)
    } else {
      console.log('   🔄 Creating Books page...')
      const booksPageData = {
        story: {
          name: 'Books',
          slug: 'books',
          content: {
            component: 'IndexBooks',
            books: [],
            list_type: 'big',
            thumbnail_type: 'below'
          },
          is_folder: false,
          parent_id: null,
          path: '',
          is_startpage: false,
          position: -1,
          published: true
        }
      }

      const pageResponse = await makeRequest(`spaces/${SPACE_ID}/stories`, 'POST', booksPageData)

      if (pageResponse.status === 200 || pageResponse.status === 201) {
        console.log('   ✅ Books page created successfully!')
        console.log(`   📄 Story ID: ${pageResponse.data.story.id}`)
        console.log(`   🔗 Slug: /${pageResponse.data.story.slug}`)
      } else {
        console.log('   ❌ Error creating page:', pageResponse.status, pageResponse.data)
        return
      }
    }

    console.log('\n🎉 Books page setup complete!')
    console.log('\n📝 What was done:')
    console.log('   • IndexBooks component set as root component')
    console.log('   • Books page created/verified in Storyblok')
    console.log('   • Page configured with IndexBooks component')

    console.log('\n🌐 Your books page should now be available at:')
    console.log('   https://your-domain.com/books')

  } catch (error) {
    console.error('❌ Error fixing books page:', error.message)
  }
}

fixBooksPage()