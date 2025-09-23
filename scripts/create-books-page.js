const { StoryblokClient } = require('storyblok-js-client')

// Initialize Storyblok Management API client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_OAUTH_TOKEN,
  region: '' // Set to 'us' if your space is in US region
})

const SPACE_ID = process.env.STORYBLOK_SPACE_ID

async function createBooksPage() {
  try {
    console.log('📚 Creating Books page in Storyblok CMS...\n')

    // Create the Books page story
    const booksPageData = {
      story: {
        name: 'Books',
        slug: 'books',
        content: {
          component: 'IndexBooks',
          books: [], // Empty initially - can be populated later in CMS
          list_type: 'big',
          thumbnail_type: 'below'
        },
        is_folder: false,
        parent_id: null, // Root level page
        path: '',
        is_startpage: false,
        position: -1,
        published: true
      }
    }

    const response = await Storyblok.post(`spaces/${SPACE_ID}/stories`, booksPageData)
    const createdStory = response.data.story

    console.log('✅ Books page created successfully!')
    console.log(`   📄 Page Name: ${createdStory.name}`)
    console.log(`   🔗 Slug: /${createdStory.slug}`)
    console.log(`   🆔 Story ID: ${createdStory.id}`)
    console.log(`   📊 Component: ${createdStory.content.component}`)

    console.log('\n📝 Next steps:')
    console.log('   1. Go to your Storyblok CMS')
    console.log('   2. Find the "Books" page in your content tree')
    console.log('   3. Edit the page and add books to the "Books" field')
    console.log('   4. Customize list_type (big/small) and thumbnail_type (above/below)')
    console.log('   5. Publish the page')

    console.log('\n🌐 Page will be available at:')
    console.log(`   https://your-domain.com/books`)

    return createdStory

  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.error_msg?.includes('slug')) {
      console.log('⚠️  Books page already exists with this slug.')
      console.log('   You can find it in your Storyblok CMS and edit it as needed.')
    } else {
      console.error('❌ Error creating Books page:', error.response?.data || error.message)
      console.log('\n🔧 Troubleshooting:')
      console.log('   - Make sure STORYBLOK_OAUTH_TOKEN is set in your environment')
      console.log('   - Make sure STORYBLOK_SPACE_ID is set in your environment')
      console.log('   - Verify your OAuth token has management permissions')
      console.log('   - Check if a page with slug "books" already exists')
    }
  }
}

// Run the script
createBooksPage()