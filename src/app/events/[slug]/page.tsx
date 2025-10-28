'use client'

import Image from "next/image";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { getEventsList } from '../events';
import { TopHero } from "@/components/TopHero";

// Interface for Event data
interface Event {
  date: string;
  contactPhoneNumber?: string; // Made optional since it's not in the Contentful data
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

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number}>({days: 0, hours: 0, minutes: 0, seconds: 0});

  useEffect(() => {
    function calculateTimeLeft() {
      const eventDate = new Date(targetDate);
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    }
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-green-700 text-white rounded-lg px-4 md:px-8 py-4 flex gap-6 items-center text-center w-[96%] md:w-max mt-4 mb-6 md:mb-0 md:absolute md:bottom-6 md:right-10 shadow-lg">
      <div>
        <div className="text-sm md:text-2xl font-bold">{timeLeft.days}</div>
        <div className="text-xs uppercase">Days</div>
      </div>
      <div className="text-sm md:text-2xl font-bold">:</div>
      <div>
        <div className="text-sm md:text-2xl font-bold">{timeLeft.hours}</div>
        <div className="text-xs uppercase">Hrs</div>
      </div>
      <div className="text-sm md:text-2xl font-bold">:</div>
      <div>
        <div className="text-sm md:text-2xl font-bold">{timeLeft.minutes}</div>
        <div className="text-xs uppercase">Mins</div>
      </div>
      <div className="text-sm md:text-2xl font-bold">:</div>
      <div>
        <div className="text-sm md:text-2xl font-bold">{timeLeft.seconds}</div>
        <div className="text-xs uppercase">Secs</div>
      </div>
    </div>
  );
}



export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventsList = await getEventsList();
        const slug = params.slug as string;

        // Find the event by matching the slug
        const foundEvent = eventsList.find((item) =>
          slugify(item.title) === slug
        );

        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setEvent(null);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      }
    };

    fetchEvent();
  }, [params.slug]);

 

  if (!event) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">Event not found</div>
      </div>
    );
  }

  return (
    <>
      <TopHero
        ministryName="Quality Education is Our Priority"
        titleLabel="Events"
      />

      <div className="bg-white">
        {/* Hero Title */}
        <section className="relative w-full h-[220px] flex items-center justify-center bg-gradient-to-br from-green-900/80 to-black/80">
          <h1 className="text-white text-3xl md:text-5xl font-bold text-center z-10">{event.title}</h1>
        </section>
        {/* Event Image & Countdown */}
        <section className="relative w-full max-w-6xl mx-auto flex flex-col items-center pt-10 pb-6 px-4">
          <div className="w-full max-w-4xl relative">
            <Image src={event.img} alt={event.title} width={1200} height={500} className="rounded-xl object-cover w-full h-[340px]" />
            <div className="md:absolute md:bottom-6 md:right-10">
              <Countdown targetDate={event.dateString} />
            </div>
          </div>
          <div className="text-gray-700 mt-8 mb-8 text-center max-w-3xl mx-auto">
            {event.details.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-4">
                  {paragraph.trim()}
                </p>
              )
            ))}
          </div>
        </section>
        {/* Event Details */}
        <section className="w-full max-w-6xl mx-auto px-4 mb-12">
          <h2 className="text-xl font-bold mb-4">EVENT DETAILS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div><span className="font-semibold">DATE:</span> <span className="ml-2">{event.date}</span></div>
            <div><span className="font-semibold">ORGANIZER:</span> <span className="ml-2">Imo State Ministry of Primary and Secondary Education</span></div>
            <div><span className="font-semibold">LOCATION:</span> <span className="ml-2">{event.location}</span></div>
            <div><span className="font-semibold">TIME:</span> <span className="ml-2">{
              new Date(event.dateString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            }</span></div>
            <div><span className="font-semibold">PHONE:</span> <span className="ml-2">{event.contactPhoneNumber}</span></div>
          </div>
        </section>
        {/* Speakers */}
        <section className="w-full max-w-6xl mx-auto px-4 mb-16">
          <h2 className="text-xl font-bold mb-6">SPEAKERS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* First Speaker */}
            {event.firstSpeaker && (
              <div className="flex flex-col items-center bg-white rounded-xl shadow p-4">
                <div className="w-40 h-48 relative mb-3 rounded-lg overflow-hidden">
                  <Image 
                    src={event.firstSpeakerPicture?.fields?.file?.url ? `https:${event.firstSpeakerPicture.fields.file.url}` : '/images/default-speaker.jpg'} 
                    alt={event.firstSpeaker} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <span className="text-green-700 font-semibold text-xs mb-1">Lead Speaker</span>
                <span className="font-bold text-lg text-center">{event.firstSpeaker}</span>
              </div>
            )}
            
            {/* Second Speaker */}
            {event.secondSpeaker && (
              <div className="flex flex-col items-center bg-white rounded-xl shadow p-4">
                <div className="w-40 h-48 relative mb-3 rounded-lg overflow-hidden">
                  <Image 
                    src={event.secondSpeakerPicture?.fields?.file?.url ? `https:${event.secondSpeakerPicture.fields.file.url}` : '/images/default-speaker.jpg'} 
                    alt={event.secondSpeaker} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <span className="text-green-700 font-semibold text-xs mb-1">Special Guest</span>
                <span className="font-bold text-lg text-center">{event.secondSpeaker}</span>
              </div>
            )}
            
            {/* Show message if no speakers */}
            {!event.firstSpeaker && !event.secondSpeaker && (
              <div className="text-gray-500 italic">
                Speaker information will be updated soon.
              </div>
            )}
          </div>
        </section>
        <CTASection
          heading="Join Us in Quality Education"
          subtext="Be part of our mission to improve the quality of education in Imo State."
          buttonLabel="Contact Us"
          buttonHref="/contact-us"
        />
        <Footer />
      </div>
    </>
  );
}