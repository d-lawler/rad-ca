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

async function createSeoComponent() {
    try {
        console.log('🚀 Creating SEO Block component via Management API...\n')

        // Get existing components
        console.log('🔍 Fetching existing components...')
        const componentsResponse = await makeRequest(`spaces/${SPACE_ID}/components`)

        if (componentsResponse.status !== 200) {
            throw new Error(`Failed to fetch components: ${componentsResponse.status}`)
        }

        const existingComponents = componentsResponse.data.components
        console.log(`✅ Found ${existingComponents.length} existing components\n`)

        // Create SeoBlock component with comprehensive SEO fields
        console.log('📝 Setting up SeoBlock component...')

        const seoBlockData = {
            component: {
                name: 'SeoBlock',
                display_name: 'SEO Block',
                schema: {
                    // Basic SEO fields
                    meta_title: {
                        type: 'text',
                        display_name: 'Meta Title',
                        required: false,
                        description: 'Page title for search engines (50-60 characters recommended)',
                        max_length: 60
                    },
                    meta_description: {
                        type: 'textarea',
                        display_name: 'Meta Description',
                        required: false,
                        description: 'Page description for search engines (150-160 characters recommended)',
                        max_length: 160
                    },
                    keywords: {
                        type: 'text',
                        display_name: 'Keywords',
                        required: false,
                        description: 'Comma-separated keywords for this page',
                        max_length: 255
                    },
                    author: {
                        type: 'text',
                        display_name: 'Author',
                        required: false,
                        description: 'Content author name',
                        max_length: 100
                    },
                    robots: {
                        type: 'option',
                        display_name: 'Robots',
                        required: false,
                        description: 'Search engine indexing instructions',
                        default_value: 'index, follow',
                        options: [
                            { name: 'index, follow', value: 'index, follow' },
                            { name: 'index, nofollow', value: 'index, nofollow' },
                            { name: 'noindex, follow', value: 'noindex, follow' },
                            { name: 'noindex, nofollow', value: 'noindex, nofollow' }
                        ]
                    },
                    canonical_url: {
                        type: 'text',
                        display_name: 'Canonical URL',
                        required: false,
                        description: 'Canonical URL for this page to prevent duplicate content issues',
                        max_length: 500
                    },

                    // Open Graph fields
                    og_title: {
                        type: 'text',
                        display_name: 'Open Graph Title',
                        required: false,
                        description: 'Title for social media sharing (falls back to meta title)',
                        max_length: 60
                    },
                    og_description: {
                        type: 'textarea',
                        display_name: 'Open Graph Description',
                        required: false,
                        description: 'Description for social media sharing (falls back to meta description)',
                        max_length: 160
                    },
                    og_image: {
                        type: 'asset',
                        display_name: 'Open Graph Image',
                        required: false,
                        filetypes: ['images'],
                        description: 'Image for social media sharing (1200x630px recommended)'
                    },
                    og_image_alt: {
                        type: 'text',
                        display_name: 'Open Graph Image Alt Text',
                        required: false,
                        description: 'Alt text for the Open Graph image',
                        max_length: 100
                    },
                    og_type: {
                        type: 'option',
                        display_name: 'Open Graph Type',
                        required: false,
                        description: 'Type of content for Open Graph',
                        default_value: 'website',
                        options: [
                            { name: 'Website', value: 'website' },
                            { name: 'Article', value: 'article' },
                            { name: 'Product', value: 'product' },
                            { name: 'Profile', value: 'profile' }
                        ]
                    },
                    og_site_name: {
                        type: 'text',
                        display_name: 'Open Graph Site Name',
                        required: false,
                        description: 'Site name for Open Graph',
                        max_length: 100
                    },

                    // Twitter Card fields
                    twitter_card: {
                        type: 'option',
                        display_name: 'Twitter Card Type',
                        required: false,
                        description: 'Type of Twitter card',
                        default_value: 'summary_large_image',
                        options: [
                            { name: 'Summary Large Image', value: 'summary_large_image' },
                            { name: 'Summary', value: 'summary' },
                            { name: 'Player', value: 'player' },
                            { name: 'App', value: 'app' }
                        ]
                    },
                    twitter_title: {
                        type: 'text',
                        display_name: 'Twitter Title',
                        required: false,
                        description: 'Title for Twitter sharing (falls back to OG title or meta title)',
                        max_length: 60
                    },
                    twitter_description: {
                        type: 'textarea',
                        display_name: 'Twitter Description',
                        required: false,
                        description: 'Description for Twitter sharing (falls back to OG description or meta description)',
                        max_length: 160
                    },
                    twitter_image: {
                        type: 'asset',
                        display_name: 'Twitter Image',
                        required: false,
                        filetypes: ['images'],
                        description: 'Image for Twitter sharing (falls back to OG image)'
                    },
                    twitter_image_alt: {
                        type: 'text',
                        display_name: 'Twitter Image Alt Text',
                        required: false,
                        description: 'Alt text for the Twitter image (falls back to OG image alt)',
                        max_length: 100
                    },
                    twitter_site: {
                        type: 'text',
                        display_name: 'Twitter Site Handle',
                        required: false,
                        description: 'Twitter username for the website (e.g., @yoursite)',
                        max_length: 50
                    },
                    twitter_creator: {
                        type: 'text',
                        display_name: 'Twitter Creator Handle',
                        required: false,
                        description: 'Twitter username for the content creator (e.g., @author)',
                        max_length: 50
                    },

                    // Advanced SEO fields
                    structured_data: {
                        type: 'textarea',
                        display_name: 'Structured Data (JSON-LD)',
                        required: false,
                        description: 'JSON-LD structured data for rich snippets'
                    },
                    alternate_languages: {
                        type: 'bloks',
                        display_name: 'Alternate Languages (Hreflang)',
                        required: false,
                        restrict_components: true,
                        component_whitelist: ['HreflangItem'],
                        description: 'Alternate language versions of this page'
                    }
                },
                is_root: false,
                is_nestable: true,
                component_group_uuid: null,
                color: '#FF9800',
                icon: 'block-search'
            }
        }

        const existingSeoBlock = existingComponents.find(c => c.name === 'SeoBlock')

        if (existingSeoBlock) {
            console.log('   📝 Updating existing SeoBlock...')
            const updateResponse = await makeRequest(
                `spaces/${SPACE_ID}/components/${existingSeoBlock.id}`,
                'PUT',
                seoBlockData
            )

            if (updateResponse.status === 200) {
                console.log('   ✅ SeoBlock updated successfully')
            } else {
                console.log(`   ❌ Failed to update SeoBlock: ${updateResponse.status}`)
                console.log('   Error:', JSON.stringify(updateResponse.data, null, 2))
            }
        } else {
            console.log('   📝 Creating new SeoBlock...')
            const createResponse = await makeRequest(
                `spaces/${SPACE_ID}/components`,
                'POST',
                seoBlockData
            )

            if (createResponse.status === 200 || createResponse.status === 201) {
                console.log('   ✅ SeoBlock created successfully')
            } else {
                console.log(`   ❌ Failed to create SeoBlock: ${createResponse.status}`)
                console.log('   Error:', JSON.stringify(createResponse.data, null, 2))
            }
        }

        console.log('\n🎉 SEO Block Component Setup Complete!\n')
        console.log('📋 SEO Fields Available:')
        console.log('   Basic SEO:')
        console.log('     • Meta Title')
        console.log('     • Meta Description')
        console.log('     • Keywords')
        console.log('     • Author')
        console.log('     • Robots directive')
        console.log('     • Canonical URL')
        console.log('\n   Open Graph (Social Media):')
        console.log('     • OG Title, Description, Image')
        console.log('     • OG Type, Site Name')
        console.log('\n   Twitter Cards:')
        console.log('     • Twitter Card Type')
        console.log('     • Twitter Title, Description, Image')
        console.log('     • Twitter Site & Creator handles')
        console.log('\n   Advanced:')
        console.log('     • Structured Data (JSON-LD)')
        console.log('     • Alternate Languages (Hreflang)')
        console.log('\n🚀 Usage:')
        console.log('   1. Add SeoBlock to any page template')
        console.log('   2. Configure SEO settings in Storyblok')
        console.log('   3. Meta tags will automatically appear in page <head>')

    } catch (error) {
        console.error('\n❌ Error creating SEO component:', error.message)
        if (error.response) {
            console.error('Response:', error.response)
        }
    }
}

// Run the script
createSeoComponent()