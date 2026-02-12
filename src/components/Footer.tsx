'use client'

import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { useState } from "react";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const info = {
    logo: "/images/IMSG-Logo.svg",
    ministry: "Ministry of Primary and Secondary Education",
    description: "The Imo State Ministry of Primary and Secondary Education was created by the administration of His Excellency, Distinguished Senator Hope Uzodinma: the Governor of Imo State to facilitate the transformation of Imo State ",
    quickLinks: [
        {
            label: "Projects",
            href: "/projects" 
        },
        {
            label: "News",
            href: "/news"
        },
        {
            label: "Services",     
            href: "/services"
        },
        {
            label: "Departments",     
            href: "/departments"
        },
        {
            label: "Events",
            href: "/events"
        },
        {
            label: "Media",
            href: "/media"
        },
        {
            label: "Contact Us",        
            href: "/contact-us"
        },
    ],
    newsletter: [
        {
            label: "Signup to Our Newsletter",          
            href: "/"
        },
        {
            label: "Subscribe",
            href: "/"
        },
    ],
    contact: [
        {
            label: "Block 3, Second Floor, Imo State Secretariat, Port Harcourt Road, Owerri",
            href: "/"
        },
        {
           label: "+234 809 547 6304",
           href: "tel:+2348095476304"
       }, 
        {
            label: "+234 8037 766 373",
            href: "tel:+2348037766373"
        },  
        
    ]
}

export default function Footer() {
    const [email, setEmail] = useState("");
  
    const validateEmail = (email: string): boolean => {
  
      // Basic email regex
      const re = /\S+@\S+\.\S+/;
      return re.test(email);
    };
  
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  
      e.preventDefault();
  
      if (validateEmail(email)) {
        Swal.fire({
          icon: "success",
          title: "Subscribed!",
          text: "You’ve successfully joined our newsletter.",
          confirmButtonColor: "#16a34a"
        });
        setEmail("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid Email",
          text: "Please enter a valid email address.",
          confirmButtonColor: "#dc2626"
        });
      }
    };
  
    return (
      <footer className="w-full bg-white pt-10 px-4 sm:px-8 md:px-18">
      <div className="mx-auto flex flex-col lg:flex-row justify-between gap-8 pb-8 max-w-5xl">
        {/* Logo and Description */}
        <AnimatedSection delay={0.1} yOffset={30}>
          <div className="flex-1 flex flex-col gap-3 items-center lg:items-start text-center lg:text-left mb-6 lg:mb-0">
            <div className="flex items-center gap-3 mb-2 justify-center lg:justify-start">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Image src={info.logo} alt="Imo State Logo" width={40} height={40} />
              </motion.div>
              <motion.span 
                className="font-semibold text-sm text-gray-900 leading-tight"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Imo State Ministry<br />
                of {info.ministry}
              </motion.span>
            </div>
            <motion.p 
              className="text-xs text-gray-600 max-w-xs"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {info.description}
            </motion.p>
          </div>
        </AnimatedSection>

        {/* Quick Links */}
        <AnimatedSection delay={0.3} yOffset={30}>
          <div className="flex-1 flex flex-col items-center lg:items-start mb-6 lg:mb-0">
            <motion.h4 
              className="font-semibold text-gray-900 mb-3"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Quick Links
            </motion.h4>
            <motion.div 
              className="flex flex-wrap flex-col sm:flex-row lg:flex-col gap-x-4 gap-y-2 text-sm text-gray-700 items-center lg:items-start justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
            >
              {info.quickLinks.map((link, index) => (
                <motion.a 
                  href={link.href} 
                  className="hover:underline hover:text-green-600 transition-colors" 
                  key={link.label}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + (index * 0.05) }}
                  whileHover={{ scale: 1.02 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Newsletter */}
        <AnimatedSection delay={0.4} yOffset={30}>
          <div className="flex-1 flex flex-col items-center lg:items-start">
            <motion.h4 
              className="font-semibold text-gray-900 mb-3"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {info.newsletter[0].label}
            </motion.h4>
            <motion.form 
              onSubmit={handleSubmit} 
              className="flex flex-col sm:flex-row w-full mb-3 gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Myemail@gmail.com"
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full transition-colors"
              />
              <motion.button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium w-full sm:w-auto transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {info.newsletter[1].label}
              </motion.button>
            </motion.form>
            <motion.div 
              className="text-xs text-gray-700 space-y-1 flex flex-col items-center lg:items-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1, delayChildren: 0.4 }}
            >
              {info.contact.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                >
                  <Link 
                    href={item.href} 
                    className="hover:text-green-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
        <div className="border-t border-gray-200 text-center py-3 text-xs text-gray-500">
        Copyright © {new Date().getFullYear()} Imo State Ministry of Primary and Secondary Education. All rights reserved. Powered by{' '}
        <a 
          href="http://imodigitalcity.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          Imo Digital City
        </a>
        </div>
      </footer>
    );
  }