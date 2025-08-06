import React from "react";
import Image from "next/image";

// Types
export type Project = {
  title: string;
  description: string;
  status: "active" | "closed";
};

type ProjectsProps = {
  projectlist: Project[];
  images: string[]; // image URLs or static paths
};

export default function ProjectCard({ projectlist, images }: ProjectsProps) {
  const activeProjects = projectlist.filter((p) => p.status === "active");
  const closedProjects = projectlist.filter((p) => p.status === "closed");

  return (
    <section className="w-full py-16 flex flex-col items-center">
      <div className="w-full md:w-[90vw] flex flex-col lg:flex-row">
        {/* Text Content */}
        <div className="flex-1 bg-white rounded-3xl shadow-lg p-8 flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-green-700 mb-6">Projects & Initiatives</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Active Projects</h2>
            <div className="space-y-4">
              {activeProjects.map((project, idx) => (
                <div
                  key={`active-${idx}`}
                  className="p-4 bg-green-50 rounded-xl border-l-4 border-green-600 shadow-sm"
                >
                  <h3 className="font-semibold text-lg text-green-800 mb-1">{project.title}</h3>
                  <p className="text-gray-700 text-sm">{project.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-500">Closed Projects</h2>
            <div className="space-y-4">
              {closedProjects.map((project, idx) => (
                <div
                  key={`closed-${idx}`}
                  className="p-4 bg-gray-100 rounded-xl border-l-4 border-gray-400 shadow-sm"
                >
                  <h3 className="font-semibold text-lg text-gray-700 mb-1">{project.title}</h3>
                  <p className="text-gray-600 text-sm">{project.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Dynamic Image Side */}
        <div className="flex-1 flex flex-col items-center justify-center lg:w-[20%] gap-6 py-4">
          {images.map((src, idx) => (
            <div
              key={idx}
              className="w-full h-56 max-w-xs relative rounded-3xl overflow-hidden shadow-lg"
            >
              <Image src={src} alt={`Project ${idx + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
