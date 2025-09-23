const MANAGEMENT_TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN

if (!MANAGEMENT_TOKEN) {
  console.error('STORYBLOK_MANAGEMENT_TOKEN environment variable is required')
  process.exit(1)
}

async function getSpaceId() {
  const response = await fetch('https://mapi.storyblok.com/v1/spaces/', {
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get spaces: ${response.statusText}`)
  }

  const data = await response.json()
  return data.spaces[0].id
}

async function getStories(spaceId, folder = '') {
  let url = `https://mapi.storyblok.com/v1/spaces/${spaceId}/stories`
  if (folder) {
    url += `?starts_with=${folder}`
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get stories: ${response.statusText}`)
  }

  const data = await response.json()
  return data.stories
}

async function main() {
  try {
    const spaceId = await getSpaceId()
    console.log(`Using space ID: ${spaceId}`)

    console.log('\n📁 All Stories:')
    const allStories = await getStories(spaceId)
    allStories.forEach(story => {
      console.log(`  ${story.full_slug} (${story.content_type || 'no content type'})`)
    })

    console.log('\n📁 Stories in projects/ folder:')
    const projectStories = await getStories(spaceId, 'projects/')
    if (projectStories.length === 0) {
      console.log('  No stories found in projects/ folder')
    } else {
      projectStories.forEach(story => {
        console.log(`  ${story.full_slug} (${story.content_type || 'no content type'})`)
      })
    }

    console.log('\n📁 Stories in exhibitions/ folder:')
    const exhibitionStories = await getStories(spaceId, 'exhibitions/')
    if (exhibitionStories.length === 0) {
      console.log('  No stories found in exhibitions/ folder')
    } else {
      exhibitionStories.forEach(story => {
        console.log(`  ${story.full_slug} (${story.content_type || 'no content type'})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()