// "use client"; // Use client-side rendering for the form page

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function AddTrainerAndCourse() {
//   // State to manage the form data for trainer and course
//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone_number: "",
//     bio: "",
//     link: "",
//     course_name: "",
//     description: "",
//     start_date: "",
//     end_date: "",
//     city_slug: "",
//   });
//   const router = useRouter();

//   // Load trainer data from local storage on page load
//   useEffect(() => {
//     const storedTrainerData = JSON.parse(localStorage.getItem("trainerData"));
//     if (storedTrainerData) {
//       setFormData((prevData) => ({
//         ...prevData,
//         ...storedTrainerData,
//       }));
//     }
//   }, []);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Store trainer data in local storage
//     const trainerData = {
//       first_name: formData.first_name,
//       last_name: formData.last_name,
//       email: formData.email,
//       phone_number: formData.phone_number,
//       bio: formData.bio,
//       link: formData.link,
//     };
//     localStorage.setItem("trainerData", JSON.stringify(trainerData));

//     // Send trainer and course data to the backend
//     const response = await fetch("/api/add", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     });

//     if (response.ok) {
//       // Redirect to a success page after a successful submission
//       router.push("/add/success");
//     } else {
//       // Handle error
//       alert("Error adding trainer and course");
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto bg-white p-8 mt-10 rounded-lg shadow-lg">
//       <h1 className="text-3xl font-semibold text-gray-800 mb-6">Trainer:in</h1>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label
//             htmlFor="first_name"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Vorname
//           </label>
//           <input
//             type="text"
//             id="first_name"
//             name="first_name"
//             value={formData.first_name}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="last_name"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Nachname
//           </label>
//           <input
//             type="text"
//             id="last_name"
//             name="last_name"
//             value={formData.last_name}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="email"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Email (wird öffentlich angezeigt) - OPTIONAL
//           </label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="phone_number"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Telefonnummer (wird öffentlich angezeigt) - OPTIONAL
//           </label>
//           <input
//             type="tel"
//             id="phone_number"
//             name="phone_number"
//             value={formData.phone_number}
//             onChange={handleChange}
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="link"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Link (z.B. zu HomePage, Instagram, FB)
//           </label>
//           <input
//             type="tel"
//             id="link"
//             name="link"
//             value={formData.link}
//             onChange={handleChange}
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="bio"
//             className="block text-sm font-medium text-gray-700"
//           >
//             sonstige Infos
//           </label>
//           <textarea
//             id="bio"
//             name="bio"
//             value={formData.bio}
//             onChange={handleChange}
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           ></textarea>
//         </div>

//         <h2 className="text-3xl font-semibold text-gray-800 mb-6">
//           Infos zum Kurs
//         </h2>
//         <div>
//           <label
//             htmlFor="course_name"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Name
//           </label>
//           <input
//             type="text"
//             id="course_name"
//             name="course_name"
//             value={formData.course_name}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="description"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Beschreibung
//           </label>
//           <textarea
//             id="description"
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           ></textarea>
//         </div>
//         <div>
//           <label
//             htmlFor="start_date"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Start-Datum
//           </label>
//           <input
//             type="date"
//             id="start_date"
//             name="start_date"
//             value={formData.start_date}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="end_date"
//             className="block text-sm font-medium text-gray-700"
//           >
//             End-Datum
//           </label>
//           <input
//             type="date"
//             id="end_date"
//             name="end_date"
//             value={formData.end_date}
//             onChange={handleChange}
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="city_slug"
//             className="block text-sm font-medium text-gray-700"
//           >
//             City Slug
//           </label>
//           <input
//             type="text"
//             id="city_slug"
//             name="city_slug"
//             value={formData.city_slug}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//         >
//           Hinzufügen
//         </button>
//       </form>
//     </div>
//   );
// }

export default function AddTrainerAndCourse() {
  return <></>;
}
