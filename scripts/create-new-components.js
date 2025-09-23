const StoryblokClient = require('storyblok-js-client')

// Initialize the Storyblok management client
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN
})

const spaceId = 287057443149790

async function createNewComponents() {
  try {
    console.log('🔄 Creating new Storyblok components...')

    // 1. Create ImageItem component (for individual images in a row)
    const imageItemComponent = {
      name: 'ImageItem',
      display_name: 'Image Item',
      schema: {
        image: {
          type: 'asset',
          display_name: 'Image',
          required: true,
          asset_folder_id: null,
          filetypes: ['images', 'videos']
        },
        size: {
          type: 'option',
          display_name: 'Size',
          description: 'Size of this image in the row',
          default_value: 'medium',
          options: [
            {
              name: 'Small',
              value: 'small'
            },
            {
              name: 'Medium',
              value: 'medium'
            },
            {
              name: 'Large',
              value: 'large'
            }
          ],
          required: false
        },
        alt_text: {
          type: 'text',
          display_name: 'Alt Text',
          description: 'Alternative text for accessibility',
          required: false
        }
      },
      is_root: false,
      is_nestable: true,
      component_group_uuid: null,
      color: '#4CAF50',
      icon: 'block-image'
    }

    // 2. Create ImageRow component (for Project pages)
    const imageRowComponent = {
      name: 'ImageRow',
      display_name: 'Image Row',
      schema: {
        alignment: {
          type: 'option',
          display_name: 'Row Alignment',
          description: 'How to align images in this row',
          default_value: 'center',
          options: [
            {
              name: 'Left',
              value: 'left'
            },
            {
              name: 'Center',
              value: 'center'
            },
            {
              name: 'Right',
              value: 'right'
            }
          ],
          required: false
        },
        images: {
          type: 'bloks',
          display_name: 'Images',
          description: 'Add multiple images to this row with individual sizing',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['ImageItem'],
          required: false
        },
        spacing: {
          type: 'option',
          display_name: 'Image Spacing',
          description: 'Space between images in this row',
          default_value: 'normal',
          options: [
            {
              name: 'Tight',
              value: 'tight'
            },
            {
              name: 'Normal',
              value: 'normal'
            },
            {
              name: 'Wide',
              value: 'wide'
            }
          ],
          required: false
        }
      },
      is_root: false,
      is_nestable: true,
      component_group_uuid: null,
      color: '#2196F3',
      icon: 'block-rows'
    }

    // 3. Create ImageGridGroup component (for Homepage)
    const imageGridGroupComponent = {
      name: 'ImageGridGroup',
      display_name: 'Image Grid Group',
      schema: {
        images: {
          type: 'asset',
          display_name: 'Images',
          description: 'Multiple images for this grid group',
          required: false,
          asset_folder_id: null,
          filetypes: ['images', 'videos'],
          multiple: true
        },
        alignment: {
          type: 'option',
          display_name: 'Group Alignment',
          description: 'How this group aligns in the grid',
          default_value: 'center',
          options: [
            {
              name: 'Left',
              value: 'left'
            },
            {
              name: 'Center',
              value: 'center'
            },
            {
              name: 'Right',
              value: 'right'
            }
          ],
          required: false
        },
        size: {
          type: 'option',
          display_name: 'Group Size',
          description: 'Overall size variant for this group',
          default_value: 'medium',
          options: [
            {
              name: 'Small',
              value: 'small'
            },
            {
              name: 'Medium',
              value: 'medium'
            },
            {
              name: 'Large',
              value: 'large'
            }
          ],
          required: false
        }
      },
      is_root: false,
      is_nestable: true,
      component_group_uuid: null,
      color: '#FF9800',
      icon: 'block-grid-3x3'
    }

    // 4. Create ImageGrid component (for Homepage)
    const imageGridComponent = {
      name: 'ImageGrid',
      display_name: 'Image Grid',
      schema: {
        grid_groups: {
          type: 'bloks',
          display_name: 'Grid Groups',
          description: 'Add image groups to create the grid layout',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['ImageGridGroup'],
          required: false
        }
      },
      is_root: false,
      is_nestable: true,
      component_group_uuid: null,
      color: '#9C27B0',
      icon: 'block-grid'
    }

    // Create all components
    const components = [
      { name: 'ImageItem', component: imageItemComponent },
      { name: 'ImageRow', component: imageRowComponent },
      { name: 'ImageGridGroup', component: imageGridGroupComponent },
      { name: 'ImageGrid', component: imageGridComponent }
    ]

    for (const { name, component } of components) {
      try {
        console.log(`📝 Creating ${name} component...`)
        const response = await Storyblok.post(`spaces/${spaceId}/components`, {
          component
        })
        console.log(`✅ ${name} component created successfully!`)
      } catch (error) {
        if (error.response?.status === 422 && error.response?.data?.error?.includes('already exists')) {
          console.log(`⚠️ ${name} component already exists, skipping...`)
        } else {
          console.error(`❌ Error creating ${name} component:`, error.response?.data || error.message)
        }
      }
    }

    // 5. Update Project component to use ImageRow
    console.log('🔄 Updating Project component to use ImageRow...')

    const updatedProjectComponent = {
      name: 'Project',
      display_name: 'Project',
      schema: {
        title: {
          type: 'text',
          display_name: 'Title',
          required: true
        },
        description: {
          type: 'textarea',
          display_name: 'Description',
          required: false
        },
        image_rows: {
          type: 'bloks',
          display_name: 'Image Rows',
          description: 'Add image rows with flexible alignment and sizing',
          restrict_type: '',
          restrict_components: true,
          component_whitelist: ['ImageRow'],
          required: false
        }
      },
      is_root: false,
      is_nestable: true,
      component_group_uuid: null,
      color: '#1b243f',
      icon: 'block-image'
    }

    try {
      // Check if Project component exists
      const response = await Storyblok.get(`spaces/${spaceId}/components`, {
        search: 'Project'
      })
      const existingProject = response.data.components.find(comp => comp.name === 'Project')

      if (existingProject) {
        console.log('📝 Updating existing Project component...')
        await Storyblok.put(`spaces/${spaceId}/components/${existingProject.id}`, {
          component: updatedProjectComponent
        })
        console.log('✅ Project component updated successfully!')
      } else {
        console.log('📝 Creating new Project component...')
        await Storyblok.post(`spaces/${spaceId}/components`, {
          component: updatedProjectComponent
        })
        console.log('✅ Project component created successfully!')
      }
    } catch (error) {
      console.error('❌ Error updating Project component:', error.response?.data || error.message)
    }

    console.log('🎉 All components created/updated successfully!')
    console.log('📋 Summary:')
    console.log('   • ImageItem: Individual image with size options')
    console.log('   • ImageRow: Container for multiple images with alignment')
    console.log('   • ImageGridGroup: Group of images for homepage grid')
    console.log('   • ImageGrid: Main container for homepage grid groups')
    console.log('   • Project: Updated to use ImageRow components')

  } catch (error) {
    console.error('❌ Error creating components:', error.response?.data || error.message)
  }
}

createNewComponents()