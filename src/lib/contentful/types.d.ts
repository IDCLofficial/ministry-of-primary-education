export interface Ministry {
    sys: {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    fields: {
        ministryName: string;
        slug: string;
        description?: string;
    };
}

export interface Author {
    sys: {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    fields: {
        name: string;
        bio?: string;
        avatar?: {
            sys: {
                id: string;
                type: string;
            };
            fields: {
                title: string;
                description?: string;
                file: {
                    url: string;
                    fileName: string;
                    contentType: string;
                };
            };
        };
    };
}

export interface Category {
    sys: {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    fields: {
        category_name: string;
        description?: string;
    };
}

export interface MediaPost {
    sys: {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    fields: {
        title: string;
        description?: string;
        img: {
            sys: {
                id: string;
                type: string;
            };
            fields: {
                title: string;
                description?: string;
                file: {
                    url: string;
                    fileName: string;
                    contentType: string;
                };
            };
        };
        isVideo: boolean;
        ministry: Ministry;
    };
}

export interface NewsPost {
    sys: {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    fields: {
        title: string;
        slug: string;
        featuredImage?: {
            sys: {
                id: string;
                type: string;
            };
            fields: {
                title: string;
                description?: string;
                file: {
                    url: string;
                    fileName: string;
                    contentType: string;
                };
            };
        };
        media?: Array<{
            sys: {
                id: string;
                type: string;
            };
            fields: {
                title: string;
                description?: string;
                file: {
                    url: string;
                    fileName: string;
                    contentType: string;
                };
            };
        }>;
        ministry?: Ministry;
        author?: Author;
        category?: Category;
        content: {
            content: Array<{
                content: Array<{
                    value: string;
                    marks?: Array<{ type: string }>;
                }>;
                nodeType: string;
            }>;
            nodeType: string;
        };
        fullNews?: string;
    };
}

export interface ProjectPost {
    sys: {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    fields: {
        projectName: string;
        slug: string;
        description: string;
        startDate: string;
        endDate?: string;
        status: 'ongoing' | 'completed' | 'upcoming';
        location: string;
        budget?: string;
        ministry: Ministry;
        featuredImage?: {
            sys: {
                id: string;
                type: string;
            };
            fields: {
                title: string;
                description?: string;
                file: {
                    url: string;
                    fileName: string;
                    contentType: string;
                };
            };
        };
        gallery?: Array<{
            sys: {
                id: string;
                type: string;
            };
            fields: {
                title: string;
                description?: string;
                file: {
                    url: string;
                    fileName: string;
                    contentType: string;
                };
            };
        }>;
    };
}

export interface EventPost {
    sys: {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    fields: {
        eventName: string;
        briefDescription: string;
        fullDescription?: string;
        eventDate: string;
        location?: string;
        contactPhoneNumber?: string;
        bannerImage?: {
            sys: {
                id: string;
                type: string;
            };
            fields: {
                title: string;
                description?: string;
                file: {
                    url: string;
                    fileName: string;
                    contentType: string;
                };
            };
        };
        firstSpeaker?: string;
        firstSpeakerPicture?: {
            sys: {
                id: string;
                type: string;
            };
            fields: {
                title: string;
                description?: string;
                file: {
                    url: string;
                    fileName: string;
                    contentType: string;
                };
            };
        };
        secondSpeaker?: string;
        secondSpeakerPicture?: {
            sys: {
                id: string;
                type: string;
            };
            fields: {
                title: string;
                description?: string;
                file: {
                    url: string;
                    fileName: string;
                    contentType: string;
                };
            };
        };
        ministry?: Ministry;
    };
} 