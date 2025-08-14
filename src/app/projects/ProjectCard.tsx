"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";
import { contentfulService } from "@/lib/contentful";

// Define the interface for your project data
export interface ProjectPost {
  sys: { id: string };
  fields: {
    projectTitle?: string;
    projectDescription?: string;
    startDate?: string;
    proposedEndDate?: string;
    projectImage?: {
      fields?: {
        title?: string;
        file?: {
          url?: string;
        };
      };
    };
  };
}

export default function Projects() {
  const [activeProjects, setActiveProjects] = useState<ProjectPost[]>([]);
  const [closedProjects, setClosedProjects] = useState<ProjectPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projects = await contentfulService.getProjectsByMinistryId(
          process.env.NEXT_PUBLIC_MINISTRY_ID || ""
        );
        console.log(projects);

        const now = new Date();

        const parseDate = (dateStr?: string) => {
          if (!dateStr) return null;
          const [day, month, year] = dateStr.split("-").map(Number);
          const date = new Date(year, month - 1, day); // month - 1 because JS months are 0-based
          return isNaN(date.getTime()) ? null : date;
        };
        
        const active = projects.filter((project: ProjectPost) => {
          const endDate = parseDate(project.fields?.proposedEndDate);
          if (!endDate) return true; // no end date means still active
          return endDate >= now;
        });
        
        const closed = projects.filter((project: ProjectPost) => {
          const endDate = parseDate(project.fields?.proposedEndDate);
          if (!endDate) return false; // no end date means not closed
          return endDate < now;
        });
        

        setActiveProjects(active);
        setClosedProjects(closed);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-16 flex justify-center items-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  return (
    <section className="w-full py-16 flex flex-col items-center">
      <div className="w-full md:w-[90vw] flex flex-col lg:flex-row">
        <div className="flex-1 bg-white rounded-3xl shadow-lg p-8 flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-green-700 mb-6">
            Projects & Initiatives
          </h1>

          {/* Active Projects */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-700">
              Active Projects
            </h2>
            <div className="space-y-4">
              {activeProjects.length > 0 ? (
                activeProjects.map((project) => (
                  <div
                    key={project.sys.id}
                    className="p-4 bg-green-50 flex flex-col md:flex-row gap-4 justify-between rounded-xl border-l-4 border-green-600 shadow-sm 
                    transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-lg hover:shadow-green-100 hover:border-green-700"
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <AnimatedSection>
                          <h3 className="font-semibold text-lg text-green-800 mb-1">
                            {project.fields?.projectTitle}
                          </h3>
                          <p className="text-gray-700 text-sm">
                            {project.fields?.projectDescription}
                          </p>
                        </AnimatedSection>
                      </div>
                      <p className="text-black text-xsm mt-4">
                        {formatDate(project.fields?.startDate)} -{" "}
                        {project.fields?.proposedEndDate
                          ? formatDate(project.fields.proposedEndDate)
                          : "Present"}
                      </p>
                    </div>
                    <div className="w-full md:w-48 h-40 relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                      {project.fields?.projectImage?.fields?.file?.url ? (
                        <Image
                          src={`https:${project.fields.projectImage.fields.file.url}`}
                          alt={
                            project.fields.projectImage.fields?.title ||
                            "Project image"
                          }
                          fill
                          className="object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">
                            No image available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No active projects at the moment.</p>
              )}
            </div>
          </section>

          {/* Closed Projects */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-500">
              Closed Projects
            </h2>
            <div className="space-y-4">
              {closedProjects.length > 0 ? (
                closedProjects.map((project) => (
                  <div
                    key={project.sys.id}
                    className="p-4 flex flex-col md:flex-row justify-between gap-4 bg-gray-100 rounded-xl border-l-4 border-gray-400 shadow-sm
                    transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-md hover:shadow-gray-200 hover:border-gray-500"
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <AnimatedSection>
                          <h3 className="font-semibold text-lg text-gray-700 mb-1">
                            {project.fields?.projectTitle}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {project.fields?.projectDescription}
                          </p>
                        </AnimatedSection>
                      </div>
                      <p className="text-black text-xsm mt-4">
                        {formatDate(project.fields?.startDate)} -{" "}
                        {project.fields?.proposedEndDate
                          ? formatDate(project.fields.proposedEndDate)
                          : "Present"}
                      </p>
                    </div>
                    <div className="w-full md:w-48 h-40 relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                      {project.fields?.projectImage?.fields?.file?.url ? (
                        <Image
                          src={`https:${project.fields.projectImage.fields.file.url}`}
                          alt={
                            project.fields.projectImage.fields?.title ||
                            "Project image"
                          }
                          fill
                          className="object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">
                            No image available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No closed projects to display.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
