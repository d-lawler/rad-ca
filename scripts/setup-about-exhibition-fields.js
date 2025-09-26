#!/usr/bin/env node

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

async function setupAboutExhibitionFields() {
    try {
        console.log('🚀 Setting up About Exhibition component fields...')

        // Get existing components
        const existingComponents = await makeRequest(`spaces/${SPACE_ID}/components`)
        if (existingComponents.status !== 200) {
            throw new Error('Failed to fetch components')
        }

        // 1. Create/Update AboutExhibitionItem with proper fields
        const aboutExhibitionItemSchema = {
            component: {
                name: 'AboutExhibitionItem',
                display_name: 'About Exhibition Item',
                schema: {
                    rich_text: {
                        type: 'richtext',
                        display_name: 'Rich Text Content',
                        required: false,
                        description: 'Rich text content for the exhibition item',
                        toolbar: ['bold', 'italic', 'underline', 'strike', 'link', 'code', 'paragraph', 'heading', 'quote', 'unordered-list', 'ordered-list']
                    },
                    image: {
                        type: 'asset',
                        display_name: 'Exhibition Image',
                        required: false,
                        filetypes: ['images'],
                        description: 'Image for the exhibition item'
                    }
                },
                is_root: false,
                is_nestable: true,
                component_group_uuid: null,
                color: '#4FC3F7',
                icon: 'block-image-text'
            }
        }

        let aboutItemComponent = existingComponents.data.components.find(c => c.name === 'AboutExhibitionItem')

        if (!aboutItemComponent) {
            console.log('📝 Creating AboutExhibitionItem component...')
            const response = await makeRequest(`spaces/${SPACE_ID}/components`, 'POST', aboutExhibitionItemSchema)
            if (response.status === 200 || response.status === 201) {
                console.log('✅ AboutExhibitionItem created with rich text and image fields')
            } else {
                throw new Error(`Failed to create AboutExhibitionItem: ${JSON.stringify(response.data)}`)
            }
        } else {
            console.log('📝 Updating AboutExhibitionItem component...')
            const response = await makeRequest(`spaces/${SPACE_ID}/components/${aboutItemComponent.id}`, 'PUT', aboutExhibitionItemSchema)
            if (response.status === 200) {
                console.log('✅ AboutExhibitionItem updated with rich text and image fields')
            } else {
                throw new Error(`Failed to update AboutExhibitionItem: ${JSON.stringify(response.data)}`)
            }
        }

        // 2. Create/Update AboutExhibitionList to contain AboutExhibitionItems
        const aboutExhibitionListSchema = {
            component: {
                name: 'AboutExhibitionList',
                display_name: 'About Exhibition List',
                schema: {
                    heading: {
                        type: 'text',
                        display_name: 'Section Heading',
                        required: false,
                        description: 'Optional heading for this exhibition section'
                    },
                    exhibitions: {
                        type: 'bloks',
                        display_name: 'Exhibition Items',
                        required: false,
                        restrict_components: true,
                        component_whitelist: ['AboutExhibitionItem'],
                        description: 'Add exhibition items with rich text and images'
                    }
                },
                is_root: false,
                is_nestable: true,
                component_group_uuid: null,
                color: '#81C784',
                icon: 'block-list'
            }
        }

        let aboutListComponent = existingComponents.data.components.find(c => c.name === 'AboutExhibitionList')

        if (!aboutListComponent) {
            console.log('📝 Creating AboutExhibitionList component...')
            const response = await makeRequest(`spaces/${SPACE_ID}/components`, 'POST', aboutExhibitionListSchema)
            if (response.status === 200 || response.status === 201) {
                console.log('✅ AboutExhibitionList created - can now contain AboutExhibitionItems')
            } else {
                throw new Error(`Failed to create AboutExhibitionList: ${JSON.stringify(response.data)}`)
            }
        } else {
            console.log('📝 Updating AboutExhibitionList component...')
            const response = await makeRequest(`spaces/${SPACE_ID}/components/${aboutListComponent.id}`, 'PUT', aboutExhibitionListSchema)
            if (response.status === 200) {
                console.log('✅ AboutExhibitionList updated - can now contain AboutExhibitionItems')
            } else {
                throw new Error(`Failed to update AboutExhibitionList: ${JSON.stringify(response.data)}`)
            }
        }

        // 3. Ensure SingleAbout can use AboutExhibitionList
        const singleAboutComponent = existingComponents.data.components.find(c => c.name === 'SingleAbout')

        if (singleAboutComponent) {
            console.log('📝 Ensuring SingleAbout can use AboutExhibitionList...')

            // Make sure exhibition_lists field exists and allows AboutExhibitionList
            if (singleAboutComponent.schema && singleAboutComponent.schema.exhibition_lists) {
                // Add AboutExhibitionList to the whitelist if not already there
                const currentWhitelist = singleAboutComponent.schema.exhibition_lists.component_whitelist || []
                if (!currentWhitelist.includes('AboutExhibitionList')) {
                    singleAboutComponent.schema.exhibition_lists.component_whitelist = [
                        ...currentWhitelist,
                        'AboutExhibitionList'
                    ]

                    const updateSchema = {
                        component: singleAboutComponent
                    }

                    const response = await makeRequest(`spaces/${SPACE_ID}/components/${singleAboutComponent.id}`, 'PUT', updateSchema)
                    if (response.status === 200) {
                        console.log('✅ SingleAbout updated to allow AboutExhibitionList')
                    } else {
                        console.log('⚠️ Warning: Could not update SingleAbout component')
                    }
                } else {
                    console.log('✅ SingleAbout already allows AboutExhibitionList')
                }
            }
        }

        console.log('\n🎉 About Exhibition components are ready!')
        console.log('📋 You can now:')
        console.log('   1. Go to your About page in Storyblok')
        console.log('   2. Add an "About Exhibition List" component')
        console.log('   3. Add "About Exhibition Item" components inside it')
        console.log('   4. Each item will have:')
        console.log('      • Rich text editor for content')
        console.log('      • Image field for exhibition images')

    } catch (error) {
        console.error('❌ Error setting up fields:', error.message)
        if (error.response) {
            console.error('Response data:', error.response)
        }
    }
}

setupAboutExhibitionFields()