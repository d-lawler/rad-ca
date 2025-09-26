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

async function createAboutExhibitionSchema() {
    try {
        console.log('🚀 Creating About Exhibition Schema via Management API...\n')

        // Get existing components to check what exists
        console.log('🔍 Fetching existing components...')
        const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)

        if (componentsResponse.status !== 200) {
            throw new Error(`Failed to fetch components: ${componentsResponse.status}`)
        }

        const existingComponents = componentsResponse.data.components
        console.log(`✅ Found ${existingComponents.length} existing components\n`)

        // 1. Create AboutExhibitionItem Component
        console.log('📝 Setting up AboutExhibitionItem component...')

        const aboutExhibitionItemData = {
            component: {
                name: 'AboutExhibitionItem',
                display_name: 'About Exhibition Item',
                schema: {
                    rich_text: {
                        type: 'richtext',
                        display_name: 'Exhibition Content',
                        required: true,
                        description: 'Rich text content describing the exhibition',
                        toolbar: [
                            'bold', 'italic', 'underline', 'strike',
                            'link', 'code', 'paragraph', 'heading',
                            'quote', 'unordered-list', 'ordered-list',
                            'horizontal-rule'
                        ]
                    },
                    image: {
                        type: 'asset',
                        display_name: 'Exhibition Image',
                        required: false,
                        filetypes: ['images'],
                        description: 'Image for this exhibition item',
                        image_crop: false,
                        image_focus: true
                    }
                },
                is_root: false,
                is_nestable: true,
                component_group_uuid: null,
                color: '#4FC3F7',
                icon: 'block-image-text'
            }
        }

        const existingAboutItem = existingComponents.find(c => c.name === 'AboutExhibitionItem')

        if (existingAboutItem) {
            console.log('   📝 Updating existing AboutExhibitionItem...')
            const updateResponse = await makeRequest(
                `spaces/${SPACE_ID}/components/${existingAboutItem.id}`,
                'PUT',
                aboutExhibitionItemData
            )

            if (updateResponse.status === 200) {
                console.log('   ✅ AboutExhibitionItem updated successfully')
            } else {
                console.log(`   ❌ Failed to update AboutExhibitionItem: ${updateResponse.status}`)
                console.log('   Error:', JSON.stringify(updateResponse.data, null, 2))
            }
        } else {
            console.log('   📝 Creating new AboutExhibitionItem...')
            const createResponse = await makeRequest(
                `spaces/${SPACE_ID}/components`,
                'POST',
                aboutExhibitionItemData
            )

            if (createResponse.status === 200 || createResponse.status === 201) {
                console.log('   ✅ AboutExhibitionItem created successfully')
            } else {
                console.log(`   ❌ Failed to create AboutExhibitionItem: ${createResponse.status}`)
                console.log('   Error:', JSON.stringify(createResponse.data, null, 2))
            }
        }

        console.log('')

        // 2. Create AboutExhibitionList Component
        console.log('📝 Setting up AboutExhibitionList component...')

        const aboutExhibitionListData = {
            component: {
                name: 'AboutExhibitionList',
                display_name: 'About Exhibition List',
                schema: {
                    heading: {
                        type: 'text',
                        display_name: 'List Heading',
                        required: false,
                        description: 'Optional heading for this exhibition section',
                        max_length: 255
                    },
                    exhibitions: {
                        type: 'bloks',
                        display_name: 'Exhibition Items',
                        required: false,
                        restrict_components: true,
                        component_whitelist: ['AboutExhibitionItem'],
                        description: 'Add exhibition items with rich text content and images',
                        maximum: 50
                    }
                },
                is_root: false,
                is_nestable: true,
                component_group_uuid: null,
                color: '#81C784',
                icon: 'block-list'
            }
        }

        const existingAboutList = existingComponents.find(c => c.name === 'AboutExhibitionList')

        if (existingAboutList) {
            console.log('   📝 Updating existing AboutExhibitionList...')
            const updateResponse = await makeRequest(
                `spaces/${SPACE_ID}/components/${existingAboutList.id}`,
                'PUT',
                aboutExhibitionListData
            )

            if (updateResponse.status === 200) {
                console.log('   ✅ AboutExhibitionList updated successfully')
            } else {
                console.log(`   ❌ Failed to update AboutExhibitionList: ${updateResponse.status}`)
                console.log('   Error:', JSON.stringify(updateResponse.data, null, 2))
            }
        } else {
            console.log('   📝 Creating new AboutExhibitionList...')
            const createResponse = await makeRequest(
                `spaces/${SPACE_ID}/components`,
                'POST',
                aboutExhibitionListData
            )

            if (createResponse.status === 200 || createResponse.status === 201) {
                console.log('   ✅ AboutExhibitionList created successfully')
            } else {
                console.log(`   ❌ Failed to create AboutExhibitionList: ${createResponse.status}`)
                console.log('   Error:', JSON.stringify(createResponse.data, null, 2))
            }
        }

        console.log('')

        // 3. Update SingleAbout to allow AboutExhibitionList
        console.log('📝 Updating SingleAbout component...')

        const singleAbout = existingComponents.find(c => c.name === 'SingleAbout')

        if (singleAbout) {
            // Ensure exhibition_lists field allows AboutExhibitionList
            if (singleAbout.schema && singleAbout.schema.exhibition_lists) {
                const currentWhitelist = singleAbout.schema.exhibition_lists.component_whitelist || []

                if (!currentWhitelist.includes('AboutExhibitionList')) {
                    singleAbout.schema.exhibition_lists.component_whitelist = [
                        ...currentWhitelist,
                        'AboutExhibitionList'
                    ]

                    const singleAboutData = {
                        component: singleAbout
                    }

                    const updateResponse = await makeRequest(
                        `spaces/${SPACE_ID}/components/${singleAbout.id}`,
                        'PUT',
                        singleAboutData
                    )

                    if (updateResponse.status === 200) {
                        console.log('   ✅ SingleAbout updated to allow AboutExhibitionList')
                    } else {
                        console.log(`   ❌ Failed to update SingleAbout: ${updateResponse.status}`)
                        console.log('   Error:', JSON.stringify(updateResponse.data, null, 2))
                    }
                } else {
                    console.log('   ✅ SingleAbout already allows AboutExhibitionList')
                }
            } else {
                console.log('   ⚠️ Warning: SingleAbout does not have exhibition_lists field')
            }
        } else {
            console.log('   ⚠️ Warning: SingleAbout component not found')
        }

        console.log('\n🎉 About Exhibition Schema Setup Complete!\n')
        console.log('📋 Summary:')
        console.log('   ✓ AboutExhibitionItem - Rich text + image fields')
        console.log('   ✓ AboutExhibitionList - Container for exhibition items')
        console.log('   ✓ SingleAbout - Updated to allow AboutExhibitionList')
        console.log('')
        console.log('🚀 Next Steps:')
        console.log('   1. Go to your About page in Storyblok CMS')
        console.log('   2. Add "About Exhibition List" component')
        console.log('   3. Add "About Exhibition Item" components inside it')
        console.log('   4. Fill in rich text content and upload images')
        console.log('   5. Publish and view your updated about page!')

    } catch (error) {
        console.error('\n❌ Error creating schema:', error.message)
        if (error.response) {
            console.error('Response:', error.response)
        }
    }
}

// Run the script
createAboutExhibitionSchema()