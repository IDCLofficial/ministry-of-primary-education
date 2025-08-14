import client from './client';
import { NewsPost, Ministry, EventPost, MediaPost, ProjectPost } from './types';

class ContentfulService {
  // Fetch all ministries
  async getMinistries(): Promise<Ministry[]> {
    if (!client) {
      console.warn('Contentful client not initialized. Please check your environment variables.');
      return [];
    }

    try {
      const response = await client.getEntries({
        content_type: 'ministry',
        order: ['fields.ministryName'],
      });

      return response.items as unknown as Ministry[];
    } catch (error) {
      console.error('Error fetching ministries:', error);
      return [];
    }
  }
// get news
  async getBlogsByMinistry(ministryId: string): Promise<NewsPost[]> {
    if (!client) {
      console.warn('Contentful client not initialized. Please check your environment variables.');
      return [];
    }

    try {
      const response = await client.getEntries({
        content_type: 'blogs',
        'fields.ministry.sys.id': ministryId,
        order: ['-sys.createdAt'],
        include: 2,
      });

      return response.items as unknown as NewsPost[];
    } catch (error) {
      console.error('Error fetching blogs by ministry:', error);
      return [];
    }
  }
// get news with slug
  async getBlogByMinistrySlug(slug: string): Promise<NewsPost | null> {
    if (!client) {
      console.warn('Contentful client not initialized. Please check your environment variables.');
      return null;
    }

    try {
      const response = await client.getEntries({
        content_type: 'blogs',
        'fields.ministry.fields.slug': slug,
        include: 2,
        limit: 1,
      });

      return response.items[0] as unknown as NewsPost || null;
    } catch (error) {
      console.error('Error fetching blog by ministry slug:', error);
      return null;
    }
  }

  // Fetch all blogs
  async getAllBlogs(): Promise<NewsPost[]> {
    if (!client) {
      console.warn('Contentful client not initialized. Please check your environment variables.');
      return [];
    }

    try {
      const response = await client.getEntries({
        content_type: 'blogs',
        order: ['-sys.createdAt'],
        include: 2, // Include linked entries (ministry, author)
      });

      return response.items as unknown as NewsPost[];
    } catch (error) {
      console.error('Error fetching all blogs:', error);
      return [];
    }
  }

  // Fetch a single blog post by slug
  async getBlogBySlug(slug: string): Promise<NewsPost | null> {
    if (!client) {
      console.warn('Contentful client not initialized. Please check your environment variables.');
      return null;
    }

    try {
      const response = await client.getEntries({
        content_type: 'blogs',
        'fields.slug': slug,
        include: 2,
        limit: 1,
      });

      return response.items[0] as unknown as NewsPost || null;
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      return null;
    }
  }

  // Fetch a ministry by slug
  async getMinistryBySlug(slug: string): Promise<Ministry | null> {
    if (!client) {
      console.warn('Contentful client not initialized. Please check your environment variables.');
      return null;
    }

    try {
      const response = await client.getEntries({
        content_type: 'ministry',
        'fields.slug': slug,
        include: 2,
        limit: 1,
      });

      return response.items[0] as unknown as Ministry || null;
    } catch (error) {
      console.error('Error fetching ministry by slug:', error);
      return null;
    }
  }
  // fetch media
  async getMediaByMinistryId(id: string): Promise<MediaPost[]> {
    if (!client) {
      console.warn('Contentful client not initialized. Please check your environment variables.');
      return [];
    }

    try {
      const response = await client.getEntries({
        content_type: 'media',
        'fields.ministry.sys.id': id,
        include: 3, // Include more levels to get the full media object
        order: ['-sys.createdAt']
      });
      
      if (!response.items || response.items.length === 0) {
        return [];
      }

      return response.items as unknown as MediaPost[];
    } catch (error) {
      console.error('Error fetching media by ministry id:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      return [];
    }
  }
// fetch events
  async getEventsByMinistryId(id: string): Promise<EventPost[]> {
    if (!client) {
      console.warn('Contentful client not initialized. Please check your environment variables.');
      return [];
    }

    try {
      const response = await client.getEntries({
        content_type: 'events',
        'fields.ministry.sys.id': id,
        include: 2,
        order: ['-sys.createdAt'],
      });

      return response.items as unknown as EventPost[];
    } catch (error) {
      console.error('Error fetching events by ministry id:', error);
      return [];
    }
  }
  // Fetch projects by ministry ID
  async getProjectsByMinistryId(ministryId: string): Promise<ProjectPost[]> {
    if (!client) {
      console.warn('Contentful client not initialized. Please check your environment variables.');
      return [];
    }

    try {
      const response = await client.getEntries({
        content_type: 'projects',
        'fields.ministry.sys.id': ministryId,
        include: 2,
        order: ['-fields.startDate']
      });

      return response.items as unknown as ProjectPost[];
    } catch (error) {
      console.error('Error fetching projects by ministry id:', error);
      return [];
    }
  }
}




// Export an instance to maintain the same usage pattern
export const contentfulService = new ContentfulService(); 