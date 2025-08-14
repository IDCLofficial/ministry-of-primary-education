import { contentfulService } from '@/lib/contentful';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  fullNews: string;
  date: string;
  image: string;
  category: string;
  slug: string;
  author: string;
  ministry: string;
  media: Array<{
    sys: {
      id: string;
      type: string;
    };
    fields: {
      file?: {
        url: string;
        details?: {
          size?: number;
          image?: {
            width?: number;
            height?: number;
          };
        };
        fileName?: string;
        contentType?: string;
      };
    };
  }>;
}


// Function to fetch news data from Contentful for a specific ministry
export const getNewsFromContentful = async (ministryId: string = process.env.NEXT_PUBLIC_MINISTRY_ID || '') => {
  try {
    const blogs = await contentfulService.getBlogsByMinistry(ministryId);
    
    // Transform Contentful data to match your current news format  
    const transformedNews = blogs.map((blog) => ({
      title: blog.fields?.title || 'No title',
      description: blog.fields?.content?.content?.[0]?.content?.[0]?.value || 'No description', // Extract from rich text content
      fullNews: blog.fields?.fullNews || 'No full content available', // Add fullNews field
      date: blog.sys?.createdAt ? new Date(blog.sys.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'No date',
      image: blog.fields?.featuredImage?.fields?.file?.url ? `https:${blog.fields.featuredImage.fields.file.url}` : '/images/default.jpg',
      category: blog.fields?.category?.fields?.category_name || 'General', // Use category_name from category field
      slug: blog.fields?.slug || '',
      id: blog.sys?.id || '',
      author: blog.fields?.author?.fields?.name || 'Unknown Author',
      ministry: blog.fields?.ministry?.fields?.ministryName || 'Unknown Ministry',
      media: blog.fields?.media || [] // Add media field
    }));
    
    return transformedNews;
  } catch (error) {
    console.error('Error fetching news from Contentful:', error);
    return [];
  }
};



// Dynamic newsList that fetches from Contentful
let cachedNewsList: NewsItem[] | null = null;

export const getNewsList = async (ministryId: string = process.env.NEXT_PUBLIC_MINISTRY_ID || ''): Promise<NewsItem[]> => {
  if (cachedNewsList) {
    return cachedNewsList;
  }
  
  try {
    const contentfulNews = await getNewsFromContentful(ministryId);
    cachedNewsList = contentfulNews;
    return contentfulNews;
  } catch (error) {
    console.error('Failed to fetch Contentful news:', error);
    cachedNewsList = [];
    return [];
  }
};

// Export dynamic newsList - this will be populated with Contentful data
export const newsList = async (ministryId: string = process.env.NEXT_PUBLIC_MINISTRY_ID || '') => {
  return await getNewsList(ministryId);
};

 


