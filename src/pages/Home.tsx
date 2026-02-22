import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck2, ShieldCheck, Stethoscope } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 items-stretch">
        <div className="ui-card p-8 md:p-10">
          <div className="flex items-center gap-3 mb-5">
            <img src="/clinova-logo.jpg" alt="Clinova" className="h-10 w-10 rounded" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clinova</h1>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-3">Run your clinic with confidence.</h2>
          <p className="text-gray-600 mb-6">
            Manage appointments, doctors, and operations from one professional workspace.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/login" className="ui-btn ui-btn-primary">
              Sign In
            </Link>
            <Link to="/login?mode=signup" className="ui-btn ui-btn-secondary">
              Create Account
            </Link>
          </div>
        </div>

        <div className="ui-card p-8 md:p-10 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <CalendarCheck2 size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Appointment Flow</p>
              <p className="text-sm text-gray-600">Schedule and track patient visits with fewer clicks.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <Stethoscope size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Doctor Operations</p>
              <p className="text-sm text-gray-600">Review requests, consultations, and history in one place.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Reliable Controls</p>
              <p className="text-sm text-gray-600">Secure access with role-based dashboards and settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
