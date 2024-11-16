"use client";

import { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bio: string;
  link: string;
  course_name: string;
  description: string;
  start_date: string;
  end_date: string;
  city_slug: string;
  extra_field: string;
}

interface CourseAddModalProps {
  slug: string;
  category: string;
}

export default function CourseAddModal({
  slug,
  category,
}: CourseAddModalProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    bio: "",
    link: "",
    course_name: "",
    description: "",
    start_date: "",
    end_date: "",
    city_slug: slug,
    extra_field: "",
  });

  const handleModalToggle = () => {
    setModalOpen(!isModalOpen);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.extra_field) {
      console.warn("Bot detected, submission blocked.");
      return;
    }

    const response = await fetch("/api/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("Course added successfully!");
      setModalOpen(false);
    } else {
      alert("Error adding course");
    }
  };

  return (
    <>
      <div className="my-4 flex justify-end">
        <button
          onClick={handleModalToggle}
          className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition duration-200"
        >
          Kurs/Training hinzufügen
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-semibold mb-4">
              Kurs/Training hinzufügen
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="extra_field"
                value={formData.extra_field}
                onChange={handleChange}
                style={{ display: "none" }}
              />

              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium"
                >
                  Vorname
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Additional form fields for last_name, email, phone_number, etc. */}

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white rounded-md"
              >
                Hinzufügen
              </button>
            </form>
            <button
              onClick={handleModalToggle}
              className="w-full py-2 mt-4 bg-gray-500 text-white rounded-md"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
