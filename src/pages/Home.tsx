import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck2, ShieldCheck, Stethoscope, Smartphone } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">

        {/* MAIN CARD */}
        <div className="ui-card p-8 md:p-10">
          <div className="flex items-center gap-3 mb-5">
            <img src="/smart-health-consultation-logo.JPG" alt="Smarthealth" className="h-10 w-10 rounded" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smarthealth</h1>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            Run your clinic with confidence.
          </h2>

          <p className="text-gray-600 mb-6">
            Manage appointments, doctors, and operations from one professional workspace.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/login" className="ui-btn ui-btn-primary-dark">
              Sign In
            </Link>

            <Link to="/login?mode=signup" className="ui-btn ui-btn-secondary">
              Create Account
            </Link>
          </div>
        </div>


        {/* FEATURES CARD */}
        <div className="ui-card p-8 md:p-10 flex flex-col gap-4">

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <CalendarCheck2 size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Appointment Flow</p>
              <p className="text-sm text-gray-600">
                Schedule and track patient visits with fewer clicks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <Stethoscope size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Doctor Operations</p>
              <p className="text-sm text-gray-600">
                Review consultations, prescriptions, and patient history in one place.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Reliable Controls</p>
              <p className="text-sm text-gray-600">
                Secure access with role-based dashboards and settings.
              </p>
            </div>
          </div>

        </div>


        {/* PATIENT MOBILE APP CARD */}
        <div className="ui-card p-8 md:p-10 flex flex-col justify-between">

          <div>
            <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
              <Smartphone size={22} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              For Patients
            </h3>

            <p className="text-gray-600 text-sm mb-6">
              Patients can book appointments, chat with doctors, and receive prescriptions directly through the Smarthealth mobile app.
            </p>
          </div>

          <a
            href="https://expo.dev/accounts/sandradush1/projects/smart-health-consultation/builds/8bdfa7f8-26cc-4d61-81c0-aba9fd425faa"
            target="_blank"
            rel="noopener noreferrer"
            className="ui-btn ui-btn-primary-dark text-center"
          >
            Download Mobile App
          </a>

        </div>

      </div>
    </div>
  );
};

export default Home;