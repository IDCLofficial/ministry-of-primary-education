import React from "react";

interface NewsBodySectionProps {
  children: React.ReactNode;
}

const NewsBodySection: React.FC<NewsBodySectionProps> = ({ children }) => (
  <section className="-mt-[150px] w-full mx-auto max-w-3xl z-20 relative">
    <div className="bg-white mx-auto rounded-xl shadow-lg p-8">
      {children}
    </div>
  </section>
);

export default NewsBodySection; 