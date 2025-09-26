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

async function updateAboutExhibitionComponents() {
    try {
        console.log('🚀 Updating About Exhibition components in Storyblok...')

        // Check if components already exist
        console.log('🔍 Checking existing components...')
        const existingComponents = await makeRequest(`spaces/${SPACE_ID}/components`)

        if (existingComponents.status !== 200) {
            throw new Error('Failed to fetch components')
        }

        const componentNames = existingComponents.data.components.map(c => c.name)
        console.log('📋 Existing components:', componentNames.length, 'components found')

        // 1. Create or update AboutExhibitionItem component
        const aboutExhibitionItem = {
            component: {
                name: 'AboutExhibitionItem',
                display_name: 'About Exhibition Item',
                schema: {
                    rich_text: {
                        type: 'richtext',
                        display_name: 'Rich Text Content',
                        required: false,
                        description: 'Rich text content for the exhibition item'
                    },
                    image: {
                        type: 'asset',
                        display_name: 'Image',
                        required: false,
                        filetypes: ['images'],
                        description: 'Exhibition image'
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
            const aboutItemResponse = await makeRequest(`spaces/${SPACE_ID}/components`, 'POST', aboutExhibitionItem)

            if (aboutItemResponse.status !== 200 && aboutItemResponse.status !== 201) {
                throw new Error(`Failed to create AboutExhibitionItem: ${aboutItemResponse.data}`)
            }

            aboutItemComponent = aboutItemResponse.data.component
            console.log('✅ AboutExhibitionItem created:', aboutItemComponent.name)
        } else {
            console.log('📝 Updating existing AboutExhibitionItem component...')
            const aboutItemResponse = await makeRequest(`spaces/${SPACE_ID}/components/${aboutItemComponent.id}`, 'PUT', aboutExhibitionItem)

            if (aboutItemResponse.status !== 200) {
                throw new Error(`Failed to update AboutExhibitionItem: ${aboutItemResponse.data}`)
            }

            console.log('✅ AboutExhibitionItem updated:', aboutItemResponse.data.component.name)
        }

        // 2. Create or update AboutExhibitionList component
        const aboutExhibitionList = {
            component: {
                name: 'AboutExhibitionList',
                display_name: 'About Exhibition List',
                schema: {
                    heading: {
                        type: 'text',
                        display_name: 'Heading',
                        required: false,
                        description: 'Optional heading for the exhibition list'
                    },
                    exhibitions: {
                        type: 'bloks',
                        display_name: 'Exhibitions',
                        required: false,
                        restrict_components: true,
                        component_whitelist: ['AboutExhibitionItem'],
                        description: 'List of about exhibition items'
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
            const aboutListResponse = await makeRequest(`spaces/${SPACE_ID}/components`, 'POST', aboutExhibitionList)

            if (aboutListResponse.status !== 200 && aboutListResponse.status !== 201) {
                throw new Error(`Failed to create AboutExhibitionList: ${aboutListResponse.data}`)
            }

            aboutListComponent = aboutListResponse.data.component
            console.log('✅ AboutExhibitionList created:', aboutListComponent.name)
        } else {
            console.log('📝 Updating existing AboutExhibitionList component...')
            const aboutListResponse = await makeRequest(`spaces/${SPACE_ID}/components/${aboutListComponent.id}`, 'PUT', aboutExhibitionList)

            if (aboutListResponse.status !== 200) {
                throw new Error(`Failed to update AboutExhibitionList: ${aboutListResponse.data}`)
            }

            console.log('✅ AboutExhibitionList updated:', aboutListResponse.data.component.name)
        }

        // 3. Update SingleAbout component to allow AboutExhibitionList in exhibition_lists
        console.log('📝 Updating SingleAbout component schema...')

        const singleAboutComponent = existingComponents.data.components.find(c => c.name === 'SingleAbout')

        if (singleAboutComponent && singleAboutComponent.schema.exhibition_lists) {
            // Update the exhibition_lists field to allow both ExhibitionList and AboutExhibitionList
            singleAboutComponent.schema.exhibition_lists.component_whitelist = [
                'ExhibitionList',
                'AboutExhibitionList'
            ]

            const updateSingleAbout = {
                component: {
                    name: singleAboutComponent.name,
                    display_name: singleAboutComponent.display_name,
                    schema: singleAboutComponent.schema,
                    is_root: singleAboutComponent.is_root,
                    is_nestable: singleAboutComponent.is_nestable,
                    component_group_uuid: singleAboutComponent.component_group_uuid,
                    color: singleAboutComponent.color,
                    icon: singleAboutComponent.icon
                }
            }

            const updateResponse = await makeRequest(`spaces/${SPACE_ID}/components/${singleAboutComponent.id}`, 'PUT', updateSingleAbout)

            if (updateResponse.status !== 200) {
                console.log('⚠️ Warning: Could not update SingleAbout component')
            } else {
                console.log('✅ SingleAbout component updated to allow AboutExhibitionList')
            }
        }

        console.log('\n🎉 Successfully updated About Exhibition components!')
        console.log('📋 Summary:')
        console.log('   ✓ AboutExhibitionItem - For individual exhibition items with rich text and images')
        console.log('   ✓ AboutExhibitionList - For lists of about exhibition items')
        console.log('   ✓ SingleAbout - Updated to allow AboutExhibitionList components')
        console.log('\n📝 You can now use these components in your About page in Storyblok!')

    } catch (error) {
        console.error('❌ Error updating components:', error.response?.data || error.message)
    }
}

updateAboutExhibitionComponents()