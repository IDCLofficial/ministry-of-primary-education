"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";

const ContactFormSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, message } = form;

    if (!name || !email || !message) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please fill in all the fields.",
      });
      return;
    }

    if (!validateEmail(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
      return;
    }

    // Success
    Swal.fire({
      icon: "success",
      title: "Message Sent!",
      text: "Thanks for contacting us. We'll get back to you shortly.",
    });

    // Reset form
    setForm({ name: "", email: "", message: "" });

    // You can also add API submission logic here
  };

  return (
    <div className="bg-black text-white p-8 rounded shadow-lg w-full max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">TALK WITH US HERE</h2>
      <p className="mb-6 text-gray-200 text-sm">
        We are here to help you with any questions you may have.
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded border border-gray-300 text-white bg-transparent placeholder-gray-300 focus:outline-none"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded border border-gray-300 text-white bg-transparent placeholder-gray-300 focus:outline-none"
          required
        />
        <textarea
          name="message"
          placeholder="Message"
          value={form.message}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded border border-gray-300 text-white bg-transparent placeholder-gray-300 focus:outline-none min-h-[100px]"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold mt-2"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContactFormSection;
