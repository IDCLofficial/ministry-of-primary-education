"use client";

import { useState } from "react";
import Image from "next/image";

interface Department {
  name: string;
  image: string;
  description: string;
}

interface UnitsTabsSectionProps {
  departments: Department[];
}

export default function UnitsTabsSection({ departments }: UnitsTabsSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!departments || departments.length === 0) {
    return <p className="text-center text-gray-500">No department data available.</p>;
  }

  const active = departments[activeIdx];

  return (
    <section className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 py-16 px-4">
      {/* Tabs */}
      <div className="w-full md:w-1/4 border-r pr-4">
        <ul className="space-y-2">
          {departments.map((dept, idx) => (
            <li key={dept.name}>
              <button
                className={`w-full text-left px-4 py-2 rounded font-semibold border transition cursor-pointer
                  ${activeIdx === idx
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-black border-transparent hover:bg-green-50 hover:text-green-700'}`}
                onClick={() => setActiveIdx(idx)}
              >
                {dept.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{active.name}</h2>
        <div className="w-full max-w-xl mb-4">
          <Image
            src={active.image}
            alt={active.name}
            width={600}
            height={300}
            className="rounded-xl object-cover"
          />
        </div>
        <p className="text-gray-700 text-sm md:text-base">{active.description}</p>
      </div>
    </section>
  );
}
