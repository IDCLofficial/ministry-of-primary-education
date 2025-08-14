import { contentfulService } from '@/lib/contentful';

// Interface for Event data
interface Event {
  date: string;
  location: string;
  title: string;
  description: string;
  img: string;
  details: string;
  dateString: string;
  id: string;
  firstSpeaker?: string;
  firstSpeakerPicture?: {
    fields?: {
      file?: {
        url?: string;
      };
    };
  };
  secondSpeaker?: string;
  secondSpeakerPicture?: {
    fields?: {
      file?: {
        url?: string;
      };
    };
  };
}

// Function to fetch events data from Contentful for a specific ministry
export const getEventsFromContentful = async (ministryId: string = process.env.NEXT_PUBLIC_MINISTRY_ID || '') => {
  try {
    const events = await contentfulService.getEventsByMinistryId(ministryId);
    
    // Transform Contentful data to match your current events format
    const transformedEvents = events.map((event) => ({
      title: event.fields?.eventName || 'No title',
      description: event.fields?.briefDescription || 'No description',
      date: event.fields?.eventDate ? new Date(event.fields.eventDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).toUpperCase() : 'NO DATE',
      location: event.fields?.location || 'Location TBD',
      img: event.fields?.bannerImage?.fields?.file?.url ? `https:${event.fields.bannerImage.fields.file.url}` : '/images/default.jpg',
      details: event.fields?.fullDescription || event.fields?.briefDescription || 'No details available',
      dateString: event.fields?.eventDate || event.sys?.createdAt || new Date().toISOString(),
      id: event.sys?.id || '',
      contactPhoneNumber: event.fields?.contactPhoneNumber || '+234 803 123 4567', // Default phone number
      firstSpeaker: event.fields?.firstSpeaker,
      firstSpeakerPicture: event.fields?.firstSpeakerPicture,
      secondSpeaker: event.fields?.secondSpeaker,
      secondSpeakerPicture: event.fields?.secondSpeakerPicture,
    }));
    
    return transformedEvents;
  } catch (error) {
    console.error('Error fetching events from Contentful:', error);
    return [];
  }
};

// Dynamic eventsList that fetches from Contentful
let cachedEventsList: Event[] | null = null;

export const getEventsList = async (ministryId?: string): Promise<Event[]> => {
  if (!cachedEventsList) {
    cachedEventsList = await getEventsFromContentful(ministryId);
  }
  return cachedEventsList;
};

// Export dynamic eventsList - this will be populated with Contentful data
export const eventsList = async (ministryId: string = process.env.NEXT_PUBLIC_MINISTRY_ID || ''): Promise<Event[]> => {
  return await getEventsList(ministryId);
};
