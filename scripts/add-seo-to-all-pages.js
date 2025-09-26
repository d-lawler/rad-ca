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

// Define SEO schema to add to all page templates
const seoSchema = {
    seo_meta_title: {
        type: 'text',
        display_name: 'SEO: Meta Title',
        required: false,
        description: 'Page title for search engines (50-60 characters recommended)',
        max_length: 60,
        pos: 1
    },
    seo_meta_description: {
        type: 'textarea',
        display_name: 'SEO: Meta Description',
        required: false,
        description: 'Page description for search engines (150-160 characters recommended)',
        max_length: 160,
        pos: 2
    },
    seo_keywords: {
        type: 'text',
        display_name: 'SEO: Keywords',
        required: false,
        description: 'Comma-separated keywords for this page',
        max_length: 255,
        pos: 3
    },
    seo_og_title: {
        type: 'text',
        display_name: 'SEO: Social Media Title',
        required: false,
        description: 'Title for social media sharing (falls back to meta title)',
        max_length: 60,
        pos: 4
    },
    seo_og_description: {
        type: 'textarea',
        display_name: 'SEO: Social Media Description',
        required: false,
        description: 'Description for social media sharing (falls back to meta description)',
        max_length: 160,
        pos: 5
    },
    seo_og_image: {
        type: 'asset',
        display_name: 'SEO: Social Media Image',
        required: false,
        filetypes: ['images'],
        description: 'Image for social media sharing (1200x630px recommended)',
        pos: 6
    },
    seo_canonical_url: {
        type: 'text',
        display_name: 'SEO: Canonical URL',
        required: false,
        description: 'Canonical URL for this page (leave empty for auto-generated)',
        max_length: 500,
        pos: 7
    },
    seo_robots: {
        type: 'option',
        display_name: 'SEO: Search Engine Indexing',
        required: false,
        description: 'How search engines should handle this page',
        default_value: 'index, follow',
        options: [
            { name: 'Index and Follow Links (Default)', value: 'index, follow' },
            { name: 'Index but Don\'t Follow Links', value: 'index, nofollow' },
            { name: 'Don\'t Index but Follow Links', value: 'noindex, follow' },
            { name: 'Don\'t Index or Follow Links', value: 'noindex, nofollow' }
        ],
        pos: 8
    }
}

async function addSeoToAllPages() {
    try {
        console.log('🚀 Adding SEO fields to all page templates...\n')

        // Get all components
        console.log('🔍 Fetching existing components...')
        const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)

        if (componentsResponse.status !== 200) {
            throw new Error(`Failed to fetch components: ${componentsResponse.status}`)
        }

        const allComponents = componentsResponse.data.components
        console.log(`✅ Found ${allComponents.length} components\n`)

        // Find all page components (components that are root/page-level)
        const pageComponents = allComponents.filter(component =>
            component.is_root === true ||
            component.name.toLowerCase().includes('page') ||
            component.name.startsWith('Single') ||
            component.name.startsWith('Index')
        )

        console.log('📄 Found page components:')
        pageComponents.forEach(component => {
            console.log(`   • ${component.name} (${component.is_root ? 'Root' : 'Nestable'})`)
        })
        console.log('')

        let updatedCount = 0
        let alreadyHadSeoCount = 0

        for (const component of pageComponents) {
            console.log(`📝 Processing ${component.name}...`)

            // Check if component already has SEO fields
            const hasExistingSeoFields = Object.keys(component.schema || {}).some(key =>
                key.startsWith('seo_')
            )

            if (hasExistingSeoFields) {
                console.log(`   ✅ Already has SEO fields - skipping`)
                alreadyHadSeoCount++
                continue
            }

            // Add SEO fields to the component schema
            const updatedSchema = {
                ...component.schema,
                ...seoSchema
            }

            const updateData = {
                component: {
                    ...component,
                    schema: updatedSchema
                }
            }

            const updateResponse = await makeRequest(
                `spaces/${SPACE_ID}/components/${component.id}`,
                'PUT',
                updateData
            )

            if (updateResponse.status === 200) {
                console.log(`   ✅ Added SEO fields successfully`)
                updatedCount++
            } else {
                console.log(`   ❌ Failed to update: ${updateResponse.status}`)
                console.log(`   Error:`, updateResponse.data?.message || 'Unknown error')
            }
        }

        console.log('\n🎉 SEO Integration Complete!\n')
        console.log('📊 Summary:')
        console.log(`   • ${updatedCount} page templates updated with SEO fields`)
        console.log(`   • ${alreadyHadSeoCount} page templates already had SEO fields`)
        console.log(`   • ${pageComponents.length} total page templates processed`)

        console.log('\n📋 SEO Fields Added to All Pages:')
        console.log('   • Meta Title & Description')
        console.log('   • Keywords')
        console.log('   • Social Media Title & Description')
        console.log('   • Social Media Image')
        console.log('   • Canonical URL')
        console.log('   • Search Engine Indexing Settings')

        console.log('\n🚀 Next Steps:')
        console.log('   1. Update your page templates to use SEO fields')
        console.log('   2. Add useHead() calls to render SEO meta tags')
        console.log('   3. Every page will now have SEO optimization!')

        if (updatedCount > 0) {
            console.log('\n💡 Page templates that were updated:')
            for (const component of pageComponents) {
                if (!Object.keys(component.schema || {}).some(key => key.startsWith('seo_'))) {
                    console.log(`   • ${component.name}`)
                }
            }
        }

    } catch (error) {
        console.error('\n❌ Error adding SEO to pages:', error.message)
        if (error.response) {
            console.error('Response:', error.response)
        }
    }
}

// Run the script
addSeoToAllPages()