import { createClient } from 'contentful';

// Check if environment variables are available
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

const hasContentfulConfig = spaceId && accessToken;

if (!hasContentfulConfig) {
  console.warn('Contentful environment variables are missing. Please add NEXT_PUBLIC_CONTENTFUL_SPACE_ID and NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN to your .env.local file.');
}

const client = hasContentfulConfig ? createClient({
  space: spaceId!,
  accessToken: accessToken!,
}) : null;

export default client; 
