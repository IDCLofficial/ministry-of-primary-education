import { contentfulService } from '@/lib/contentful';
import { MediaPost } from '@/lib/contentful/types';

// Type for media item based on the current implementation
export interface MediaItem {
  image: string;
  title: string;
  isVideo: boolean;
}

// Fetch media data from Contentful
export const fetchMediaData = async (ministryId: string = process.env.NEXT_PUBLIC_MINISTRY_ID || ''): Promise<MediaItem[]> => {
  try {
    const mediaPosts = await contentfulService.getMediaByMinistryId(ministryId) as unknown as MediaPost[];
    
    if (!mediaPosts || mediaPosts.length === 0) {
      return [];
    }

    
    
    // Map each post to a media item
    const mediaItems = mediaPosts.map(post => {
      // Extract the image URL from the img field
      const imageUrl = post.fields?.img?.fields?.file?.url 
        ? `https:${post.fields.img.fields.file.url}` 
        : '';
      
      const isVideo = post.fields?.isVideo || false;
      
      return {
        image: imageUrl,
        title: post.fields?.title || 'Untitled Media',
        isVideo: isVideo,
      };
    });
    
    // Filter out any items without an image URL
    const validMediaItems = mediaItems.filter(item => item.image);
    
    return validMediaItems;
  } catch (error) {
    console.error('Error in fetchMediaData:', error);
    return [];
  }
};

// Default export for backward compatibility
export default fetchMediaData;
