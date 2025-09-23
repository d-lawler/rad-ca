const { StoryblokClient } = require('storyblok-js-client')

// Initialize Storyblok Management API client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_OAUTH_TOKEN,
  region: '' // Set to 'us' if your space is in US region
})

const SPACE_ID = process.env.STORYBLOK_SPACE_ID

async function setupCMSContentTypes() {
  try {
    console.log('🚀 Setting up CMS content types for Books and Exhibition Lists...\n')

    // 1. Create SingleBook content type (must be created first for IndexBooks to reference it)
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

    await Storyblok.post(`spaces/${SPACE_ID}/components`, { component: singleBookComponent })
    console.log('   ✓ SingleBook content type created')

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

    await Storyblok.post(`spaces/${SPACE_ID}/components`, { component: indexBooksComponent })
    console.log('   ✓ IndexBooks content type created')

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

    await Storyblok.post(`spaces/${SPACE_ID}/components`, { component: exhibitionListComponent })
    console.log('   ✓ ExhibitionList content type created')

    // 4. Update SingleAbout content type
    console.log('4️⃣ Updating SingleAbout content type...')

    // Get existing SingleAbout component
    const response = await Storyblok.get(`spaces/${SPACE_ID}/components`)
    const components = response.data.components
    const singleAboutComponent = components.find(comp => comp.name === 'SingleAbout')

    if (!singleAboutComponent) {
      console.warn('   ⚠️ SingleAbout component not found - you may need to create it manually')
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

      await Storyblok.put(`spaces/${SPACE_ID}/components/${singleAboutComponent.id}`, updateData)
      console.log('   ✓ SingleAbout content type updated with exhibition_lists field')
    }

    console.log('\n🎉 CMS Setup Complete!')
    console.log('\n📋 Summary of what was created:')
    console.log('   • SingleBook - Individual book pages')
    console.log('   • IndexBooks - Book listing pages')
    console.log('   • ExhibitionList - Configurable exhibition groups')
    console.log('   • SingleAbout - Updated with exhibition_lists support')

    console.log('\n📝 Next steps in Storyblok CMS:')
    console.log('   1. Create some SingleBook entries')
    console.log('   2. Create an IndexBooks page and select books to display')
    console.log('   3. Update your About page to use ExhibitionList components')
    console.log('   4. Add exhibition_lists blocks with custom headings and content')

  } catch (error) {
    console.error('❌ Error setting up content types:', error.response?.data || error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   - Make sure STORYBLOK_OAUTH_TOKEN is set in your environment')
    console.log('   - Make sure STORYBLOK_SPACE_ID is set in your environment')
    console.log('   - Verify your OAuth token has management permissions')
  }
}

// Run the script
setupCMSContentTypes()