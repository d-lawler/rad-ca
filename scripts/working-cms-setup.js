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

async function createContentTypes() {
  try {
    console.log('🚀 Creating CMS Content Types for Books and Exhibition Lists...\n')

    // 1. Create SingleBook content type
    console.log('1️⃣ Creating SingleBook content type...')
    const singleBookComponent = {
      component: {
        name: 'SingleBook',
        display_name: 'Single Book',
        is_root: true,
        is_nestable: false,
        component_group_uuid: null,
        schema: {
          name: {
            type: 'text',
            display_name: 'Book Title',
            description: 'The title of the book',
            required: true
          },
          featured_image: {
            type: 'asset',
            display_name: 'Featured Image',
            description: 'Main cover image for the book',
            required: false,
            filetypes: ['images']
          },
          featured_video: {
            type: 'asset',
            display_name: 'Featured Video',
            description: 'Optional video instead of featured image',
            required: false,
            filetypes: ['videos']
          },
          content: {
            type: 'bloks',
            display_name: 'Book Content',
            description: 'Add image rows and content blocks',
            required: false,
            restrict_components: true,
            component_whitelist: ['ImageRow', 'ImageGridGroup', 'AssetGroup']
          },
          story_text: {
            type: 'richtext',
            display_name: 'Book Description',
            description: 'Rich text description of the book',
            required: false,
            toolbar: ['bold', 'italic', 'strike', 'underline', 'code', 'link']
          }
        }
      }
    }

    try {
      const response1 = await makeRequest(`spaces/${SPACE_ID}/components`, 'POST', singleBookComponent)
      if (response1.status === 200 || response1.status === 201) {
        console.log('   ✅ SingleBook content type created')
      } else if (response1.status === 422) {
        console.log('   ⚠️  SingleBook content type already exists')
      } else {
        console.log('   ❌ Error creating SingleBook:', response1.data)
      }
    } catch (error) {
      console.log('   ❌ Error creating SingleBook:', error.message)
    }

    // 2. Create IndexBooks content type
    console.log('2️⃣ Creating IndexBooks content type...')
    const indexBooksComponent = {
      component: {
        name: 'IndexBooks',
        display_name: 'Index Books',
        is_root: false,
        is_nestable: true,
        component_group_uuid: null,
        schema: {
          books: {
            type: 'options',
            display_name: 'Books',
            description: 'Select multiple book entries to display',
            required: false,
            source: 'internal_stories',
            filter_content_type: ['SingleBook'],
            use_uuid: true
          },
          list_type: {
            type: 'option',
            display_name: 'List Type',
            description: 'Choose the display style for book titles',
            required: false,
            options: [
              { name: 'Big', value: 'big' },
              { name: 'Small', value: 'small' }
            ],
            default_value: 'big'
          },
          thumbnail_type: {
            type: 'option',
            display_name: 'Thumbnail Position',
            description: 'Choose where thumbnails appear',
            required: false,
            options: [
              { name: 'Below Title', value: 'below' },
              { name: 'Above Title', value: 'above' }
            ],
            default_value: 'below'
          }
        }
      }
    }

    try {
      const response2 = await makeRequest(`spaces/${SPACE_ID}/components`, 'POST', indexBooksComponent)
      if (response2.status === 200 || response2.status === 201) {
        console.log('   ✅ IndexBooks content type created')
      } else if (response2.status === 422) {
        console.log('   ⚠️  IndexBooks content type already exists')
      } else {
        console.log('   ❌ Error creating IndexBooks:', response2.data)
      }
    } catch (error) {
      console.log('   ❌ Error creating IndexBooks:', error.message)
    }

    // 3. Create ExhibitionList content type
    console.log('3️⃣ Creating ExhibitionList content type...')
    const exhibitionListComponent = {
      component: {
        name: 'ExhibitionList',
        display_name: 'Exhibition List',
        is_root: false,
        is_nestable: true,
        component_group_uuid: null,
        schema: {
          heading: {
            type: 'text',
            display_name: 'Exhibition List Heading',
            description: 'Heading for this group of exhibitions',
            required: true
          },
          content: {
            type: 'richtext',
            display_name: 'Exhibition Content',
            description: 'Rich text content for this exhibition list',
            required: false,
            toolbar: ['bold', 'italic', 'strike', 'underline', 'code', 'link', 'paragraph']
          },
          exhibitions: {
            type: 'options',
            display_name: 'Exhibitions',
            description: 'Select multiple exhibitions for this list',
            required: false,
            source: 'internal_stories',
            filter_content_type: ['SingleExhibition'],
            use_uuid: true
          }
        }
      }
    }

    try {
      const response3 = await makeRequest(`spaces/${SPACE_ID}/components`, 'POST', exhibitionListComponent)
      if (response3.status === 200 || response3.status === 201) {
        console.log('   ✅ ExhibitionList content type created')
      } else if (response3.status === 422) {
        console.log('   ⚠️  ExhibitionList content type already exists')
      } else {
        console.log('   ❌ Error creating ExhibitionList:', response3.data)
      }
    } catch (error) {
      console.log('   ❌ Error creating ExhibitionList:', error.message)
    }

    // 4. Update SingleAbout content type
    console.log('4️⃣ Updating SingleAbout content type...')
    try {
      // First get existing components
      const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)
      if (componentsResponse.status === 200) {
        const components = componentsResponse.data.components
        const singleAboutComponent = components.find(comp => comp.name === 'SingleAbout')

        if (!singleAboutComponent) {
          console.log('   ⚠️  SingleAbout component not found - skipping update')
        } else {
          // Add exhibition_lists field to existing schema
          const updatedSchema = {
            ...singleAboutComponent.schema,
            exhibition_lists: {
              type: 'bloks',
              display_name: 'Exhibition Lists',
              description: 'Add multiple exhibition lists with custom headings and content',
              required: false,
              restrict_components: true,
              component_whitelist: ['ExhibitionList']
            }
          }

          const updateData = {
            component: {
              name: singleAboutComponent.name,
              display_name: singleAboutComponent.display_name,
              is_root: singleAboutComponent.is_root,
              is_nestable: singleAboutComponent.is_nestable,
              component_group_uuid: singleAboutComponent.component_group_uuid,
              schema: updatedSchema
            }
          }

          const response4 = await makeRequest(`spaces/${SPACE_ID}/components/${singleAboutComponent.id}`, 'PUT', updateData)
          if (response4.status === 200) {
            console.log('   ✅ SingleAbout content type updated with exhibition_lists field')
          } else {
            console.log('   ❌ Error updating SingleAbout:', response4.data)
          }
        }
      }
    } catch (error) {
      console.log('   ❌ Error updating SingleAbout:', error.message)
    }

    // 5. Create Books page
    console.log('5️⃣ Creating Books page...')
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

    try {
      const response5 = await makeRequest(`spaces/${SPACE_ID}/stories`, 'POST', booksPageData)
      if (response5.status === 200 || response5.status === 201) {
        const createdStory = response5.data.story
        console.log('   ✅ Books page created successfully!')
        console.log(`   📄 Page Name: ${createdStory.name}`)
        console.log(`   🔗 Slug: /${createdStory.slug}`)
        console.log(`   🆔 Story ID: ${createdStory.id}`)
      } else if (response5.status === 422) {
        console.log('   ⚠️  Books page already exists with this slug')
      } else {
        console.log('   ❌ Error creating Books page:', response5.data)
      }
    } catch (error) {
      console.log('   ❌ Error creating Books page:', error.message)
    }

    console.log('\n🎉 CMS Setup Complete!')
    console.log('\n📋 What was created/updated:')
    console.log('   • SingleBook content type')
    console.log('   • IndexBooks content type')
    console.log('   • ExhibitionList content type')
    console.log('   • SingleAbout content type (updated)')
    console.log('   • Books page (/books)')

    console.log('\n📝 Next steps in Storyblok CMS:')
    console.log('   1. Create some SingleBook entries')
    console.log('   2. Edit the Books page and add books to display')
    console.log('   3. Update your About page with ExhibitionList components')
    console.log('   4. Publish all pages')

    console.log('\n🌐 Available pages:')
    console.log('   • /books - Book listing page')
    console.log('   • /about - About page with exhibition lists')
    console.log('   • /book/[slug] - Individual book pages')

  } catch (error) {
    console.error('❌ Error during CMS setup:', error.message)
  }
}

// Run the script
createContentTypes()