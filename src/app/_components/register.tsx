"use client";

import { useState } from "react";

export default function RegisterModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (formData.username.length < 3)
      newErrors.username = "Username muss mindestens 3 Zeichen lang sein";
    if (!formData.email.includes("@"))
      newErrors.email = "Ungültige E-Mail-Adresse";
    if (formData.password.length < 6)
      newErrors.password = "Passwort muss mindestens 6 Zeichen haben";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwörter stimmen nicht überein";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      console.log("Registrierungsdaten:", formData);
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl flex">
        <div className="w-1/2 bg-gray-100 flex flex-col items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
          <div className="text-6xl mt-4">😊</div>
        </div>
        <div className="w-1/2 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Register with your e-mail
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">E-Mail</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">
                Repeat Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 border-gray-300 rounded"
              />
              <span className="text-sm">
                I have read and accept the Terms and Conditions
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              Create Account
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-500">Or register with</p>
          <div className="flex gap-4 mt-2">
            <button className="flex-1 border border-gray-300 py-2 rounded">
              Google
            </button>
            <button className="flex-1 border border-gray-300 py-2 rounded">
              Twitter
            </button>
            <button className="flex-1 border border-gray-300 py-2 rounded">
              Facebook
            </button>
          </div>
          <button onClick={onClose} className="mt-4 text-sm text-gray-500">
            Already a member? Log in now
          </button>
        </div>
      </div>
    </div>
  );
}
