const { Storyblok: StoryblokClient } = require('storyblok-js-client')

// Initialize Storyblok Management API client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN,
  region: '' // Set to 'us' if your space is in US region
})

let SPACE_ID = process.env.STORYBLOK_SPACE_ID

async function completeCMSSetup() {
  try {
    console.log('🚀 Complete CMS Setup for Books and Exhibition Lists...\n')

    // Get Space ID if not set
    if (!SPACE_ID) {
      console.log('🔍 Getting Space ID...')
      const spacesResponse = await Storyblok.get('spaces')
      if (spacesResponse.data.spaces && spacesResponse.data.spaces.length > 0) {
        SPACE_ID = spacesResponse.data.spaces[0].id
        console.log(`   ✓ Found Space ID: ${SPACE_ID}`)
      } else {
        throw new Error('No spaces found in your account')
      }
    }

    // STEP 1: Create content types
    console.log('📝 STEP 1: Creating Content Types\n')

    // 1. Create SingleBook content type
    console.log('1️⃣ Creating SingleBook content type...')
    const singleBookComponent = {
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
          required: true,
          max_length: '',
          min_length: ''
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
          max_length: '',
          toolbar: ['bold', 'italic', 'strike', 'underline', 'code', 'link']
        }
      }
    }

    try {
      await Storyblok.post(`spaces/${SPACE_ID}/components`, { component: singleBookComponent })
      console.log('   ✓ SingleBook content type created')
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('   ⚠️  SingleBook content type already exists')
      } else {
        throw error
      }
    }

    // 2. Create IndexBooks content type
    console.log('2️⃣ Creating IndexBooks content type...')
    const indexBooksComponent = {
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
          options: [],
          source: 'internal_stories',
          folder_slug: '',
          datasource_slug: '',
          filter_content_type: ['SingleBook'],
          max_options: '',
          min_options: '',
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

    try {
      await Storyblok.post(`spaces/${SPACE_ID}/components`, { component: indexBooksComponent })
      console.log('   ✓ IndexBooks content type created')
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('   ⚠️  IndexBooks content type already exists')
      } else {
        throw error
      }
    }

    // 3. Create ExhibitionList content type
    console.log('3️⃣ Creating ExhibitionList content type...')
    const exhibitionListComponent = {
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
          required: true,
          max_length: '',
          min_length: ''
        },
        content: {
          type: 'richtext',
          display_name: 'Exhibition Content',
          description: 'Rich text content for this exhibition list',
          required: false,
          max_length: '',
          toolbar: ['bold', 'italic', 'strike', 'underline', 'code', 'link', 'paragraph']
        },
        exhibitions: {
          type: 'options',
          display_name: 'Exhibitions',
          description: 'Select multiple exhibitions for this list',
          required: false,
          options: [],
          source: 'internal_stories',
          folder_slug: '',
          datasource_slug: '',
          filter_content_type: ['SingleExhibition'],
          max_options: '',
          min_options: '',
          use_uuid: true
        }
      }
    }

    try {
      await Storyblok.post(`spaces/${SPACE_ID}/components`, { component: exhibitionListComponent })
      console.log('   ✓ ExhibitionList content type created')
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('   ⚠️  ExhibitionList content type already exists')
      } else {
        throw error
      }
    }

    // 4. Update SingleAbout content type
    console.log('4️⃣ Updating SingleAbout content type...')
    const response = await Storyblok.get(`spaces/${SPACE_ID}/components`)
    const components = response.data.components
    const singleAboutComponent = components.find(comp => comp.name === 'SingleAbout')

    if (!singleAboutComponent) {
      console.log('   ⚠️  SingleAbout component not found - skipping update')
    } else {
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

      await Storyblok.put(`spaces/${SPACE_ID}/components/${singleAboutComponent.id}`, updateData)
      console.log('   ✓ SingleAbout content type updated with exhibition_lists field')
    }

    // STEP 2: Create Books page
    console.log('\n📄 STEP 2: Creating Books Page\n')

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
      const pageResponse = await Storyblok.post(`spaces/${SPACE_ID}/stories`, booksPageData)
      const createdStory = pageResponse.data.story
      console.log('✅ Books page created successfully!')
      console.log(`   📄 Page Name: ${createdStory.name}`)
      console.log(`   🔗 Slug: /${createdStory.slug}`)
      console.log(`   🆔 Story ID: ${createdStory.id}`)
    } catch (error) {
      if (error.response?.status === 422 && error.response?.data?.error_msg?.includes('slug')) {
        console.log('⚠️  Books page already exists with this slug')
      } else {
        throw error
      }
    }

    // SUCCESS SUMMARY
    console.log('\n🎉 Complete CMS Setup Finished!')
    console.log('\n📋 What was created/updated:')
    console.log('   ✓ SingleBook content type')
    console.log('   ✓ IndexBooks content type')
    console.log('   ✓ ExhibitionList content type')
    console.log('   ✓ SingleAbout content type (updated)')
    console.log('   ✓ Books page (/books)')

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
    console.error('❌ Error during CMS setup:', error.response?.data || error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   - Make sure STORYBLOK_MANAGEMENT_TOKEN is set in your environment')
    console.log('   - Make sure STORYBLOK_SPACE_ID is set in your environment (optional - will auto-detect)')
    console.log('   - Verify your management token has correct permissions')
    console.log('   - Current token status:', process.env.STORYBLOK_MANAGEMENT_TOKEN ? 'Set' : 'Not set')
  }
}

// Run the script
completeCMSSetup()