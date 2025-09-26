export const useSeo = (pageData, options = {}) => {
    // Extract SEO fields from page data (works with Storyblok story structure)
    const seoFields = pageData?.content || pageData || {}

    // Get current route for fallback canonical URL
    const route = useRoute()
    const config = useRuntimeConfig()

    // Generate canonical URL if not provided
    const canonicalUrl = seoFields.seo_canonical_url ||
                        (config.public.siteUrl ? `${config.public.siteUrl}${route.path}` : undefined)

    // Log SEO data in development
    if (process.dev) {
        console.log('🎯 useSeo called for page:', route.path, {
            hasTitle: !!seoFields.seo_meta_title,
            hasDescription: !!seoFields.seo_meta_description,
            hasOgImage: !!seoFields.seo_og_image?.filename,
            fallbackTitle: options.fallbackTitle,
            canonicalUrl
        })
    }

    // Prepare meta tags
    const metaTags = [
        // Basic SEO
        {
            name: 'description',
            content: seoFields.seo_meta_description || options.fallbackDescription
        },
        {
            name: 'keywords',
            content: seoFields.seo_keywords
        },
        {
            name: 'robots',
            content: seoFields.seo_robots || 'index, follow'
        },

        // Open Graph
        {
            property: 'og:title',
            content: seoFields.seo_og_title || seoFields.seo_meta_title || options.fallbackTitle
        },
        {
            property: 'og:description',
            content: seoFields.seo_og_description || seoFields.seo_meta_description || options.fallbackDescription
        },
        {
            property: 'og:image',
            content: seoFields.seo_og_image?.filename
        },
        {
            property: 'og:type',
            content: 'website'
        },
        {
            property: 'og:url',
            content: canonicalUrl
        },

        // Twitter Cards
        {
            name: 'twitter:card',
            content: 'summary_large_image'
        },
        {
            name: 'twitter:title',
            content: seoFields.seo_og_title || seoFields.seo_meta_title || options.fallbackTitle
        },
        {
            name: 'twitter:description',
            content: seoFields.seo_og_description || seoFields.seo_meta_description || options.fallbackDescription
        },
        {
            name: 'twitter:image',
            content: seoFields.seo_og_image?.filename
        }
    ].filter(meta => meta.content) // Remove empty meta tags

    // Prepare links
    const links = []
    if (canonicalUrl) {
        links.push({
            rel: 'canonical',
            href: canonicalUrl
        })
    }

    // Apply SEO to page head
    useHead({
        title: seoFields.seo_meta_title || options.fallbackTitle,
        meta: metaTags,
        link: links
    })

    // Return SEO data for debugging/additional use
    return {
        title: seoFields.seo_meta_title || options.fallbackTitle,
        description: seoFields.seo_meta_description || options.fallbackDescription,
        keywords: seoFields.seo_keywords,
        ogImage: seoFields.seo_og_image?.filename,
        canonicalUrl,
        robots: seoFields.seo_robots || 'index, follow'
    }
}