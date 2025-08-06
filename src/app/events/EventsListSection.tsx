import Image from "next/image";
import Link from "next/link";

type EventType = {
  date: string;
  location: string;
  title: string;
  description: string;
  img: string;
  details: string;
  dateString: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function EventsListSection({ events }: { events: EventType[] }) {
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.dateString) >= now);
  const pastEvents = events.filter(e => new Date(e.dateString) < now);

  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4">
      {/* Upcoming Events Section */}
      <h2 className="text-2xl md:text-3xl font-bold mb-8">Upcoming Events</h2>
      {upcomingEvents.length > 0 ? (
        <div className="flex flex-col gap-8 mb-16">
          {upcomingEvents.map((event) => (
            <div key={event.title + event.dateString} className="flex flex-col md:flex-row gap-6 items-center border-b pb-8 last:border-b-0">
              <div className="w-full md:w-64 h-40 relative rounded overflow-hidden flex-shrink-0">
                <Image src={event.img} alt={event.title} fill className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 text-gray-500 text-xs mb-1">
                    <span>{event.date}</span>
                    <span className="hidden md:inline">|</span>
                    <span>{event.location}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                  <p className="text-gray-700 text-sm mb-2">{event.description}</p>
                </div>
                <div className="flex justify-end md:justify-center">
                  <Link
                    href={`/events/${slugify(event.title)}`}
                    className="border border-green-600 text-green-700 px-4 py-2 rounded font-semibold hover:bg-green-50 transition"
                  >
                    More Information
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 italic mb-16">No upcoming events at this time.</div>
      )}

      {/* Past Events Section */}
      <h2 className="text-2xl md:text-3xl font-bold mb-8">Past Events</h2>
      {pastEvents.length > 0 ? (
        <div className="flex flex-col gap-8">
          {pastEvents.map((event) => (
            <div key={event.title + event.dateString} className="flex flex-col md:flex-row gap-6 items-center border-b pb-8 last:border-b-0 opacity-70">
              <div className="w-full md:w-64 h-40 relative rounded overflow-hidden flex-shrink-0">
                <Image src={event.img} alt={event.title} fill className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 text-gray-500 text-xs mb-1">
                    <span>{event.date}</span>
                    <span className="hidden md:inline">|</span>
                    <span>{event.location}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                  <p className="text-gray-700 text-sm mb-2">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 italic">No past events yet.</div>
      )}
    </section>
  );
}
