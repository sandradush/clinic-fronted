import React from 'react';
import { Sparkles, Rocket, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from './Card';
import Button from './Button';
import { trackEvent } from '../../services/analytics';

const OnboardingModal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const key = `onboarding_seen_${user.id || user.email}`;
    const hasSeen = localStorage.getItem(key);
    if (!hasSeen) {
      setIsOpen(true);
      trackEvent('onboarding_seen', { role: user.role });
    }
  }, [user]);

  const markSeen = () => {
    if (!user) return;
    localStorage.setItem(`onboarding_seen_${user.id || user.email}`, 'true');
    setIsOpen(false);
  };

  const openAction = (path: string, action: string) => {
    trackEvent('onboarding_completed', { action, role: user?.role || 'unknown' });
    markSeen();
    navigate(path);
  };

  if (!isOpen || !user) return null;

  const primaryActions =
    user.role === 'admin'
      ? [
          { label: 'Add Appointment', path: '/appointments/new', action: 'new_appointment' },
        ]
      : [
          { label: 'Set Up Profile', path: '/profilesetup', action: 'profile_setup' },
          { label: 'Open Dashboard', path: '/dashboard', action: 'open_dashboard' },
        ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Welcome onboarding">
      <Card className="w-full max-w-xl p-6 md:p-8">
        <div className="flex items-center gap-2 text-brand-600 mb-3">
          <Sparkles size={20} />
          <span className="font-semibold">Welcome to Clinova</span>
        </div>

        <h2 className="text-2xl font-bold mb-2">Start faster with guided setup</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-5">
          Clinova helps you organize people, appointments, and approvals from one workspace. Complete your top task in 1 click.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <div className="ui-card p-3 flex items-start gap-2">
            <Rocket className="text-brand-600 mt-0.5" size={18} />
            <p className="text-sm">Launch critical workflows instantly from the sidebar.</p>
          </div>
          <div className="ui-card p-3 flex items-start gap-2">
            <CheckCircle className="text-green-600 mt-0.5" size={18} />
            <p className="text-sm">Track key actions like signups, saves, and role updates automatically.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {primaryActions.map((item) => (
            <Button key={item.action} onClick={() => openAction(item.path, item.action)}>
              {item.label}
            </Button>
          ))}
          <Button
            variant="secondary"
            onClick={() => {
              trackEvent('onboarding_skipped', { role: user.role });
              markSeen();
            }}
          >
            Skip for now
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingModal;
