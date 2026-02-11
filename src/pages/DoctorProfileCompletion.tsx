import React, { useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { makeApiRequest } from "../utils/api";

interface DoctorProfileCompletionData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  specialization: string;
  experience: number | "";
  licenseNumber: string;
  hospitalName: string;
  licenseDocument: File | null;
  idDocument: File | null;
}

const DoctorProfileCompletion: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<DoctorProfileCompletionData>({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    specialization: "",
    experience: "",
    licenseNumber: "",
    hospitalName: "",
    licenseDocument: null,
    idDocument: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          payload.append(key, value as any);
        }
      });

      await makeApiRequest(`/doctors/${user?.id}/complete-profile`, {
        method: "POST",
        body: payload,
      });

      // Update user status to PENDING in localStorage
      const updatedUser = { ...user, status: 'PENDING' };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success("Profile submitted! Waiting for admin approval.");
      setTimeout(() => {
        toast.info('Please wait for admin verification. You will be notified once approved.');
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 border rounded shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-4">Doctor Registration / Profile Completion</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <select
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Specialization</option>
          <option value="General Practitioner">General Practitioner</option>
          <option value="Dentist">Dentist</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="number"
          name="experience"
          placeholder="Years of Experience"
          value={formData.experience}
          onChange={handleChange}
          min={0}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="licenseNumber"
          placeholder="Medical License Number"
          value={formData.licenseNumber}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="hospitalName"
          placeholder="Hospital / Clinic Name"
          value={formData.hospitalName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <label className="block font-medium">Medical License Document *</label>
        <input
          type="file"
          name="licenseDocument"
          onChange={handleFileChange}
          required
          className="w-full mb-2"
        />
        <label className="block font-medium">National ID / Certificate (Optional)</label>
        <input
          type="file"
          name="idDocument"
          onChange={handleFileChange}
          className="w-full mb-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Submitting..." : "Submit Registration"}
        </button>
      </form>
    </div>
  );
};

export default DoctorProfileCompletion;
