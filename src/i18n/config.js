import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        search: 'Search...',
        loading: 'Loading...',
      },
      
      // Dashboard
      dashboard: {
        welcome: 'Welcome back',
        subtitle: 'Here\'s what\'s happening in your clinic today',
        totalPatients: 'Total Patients',
        todayAppointments: 'Today\'s Appointments',
        pendingPrescriptions: 'Pending Prescriptions',
        waitingRoom: 'Waiting Room',
        notifications: 'Notifications',
        searchPlaceholder: 'Search patients, appointments...',
        todaysSchedule: "Today's Schedule",
        viewAll: 'View All',
        quickActions: 'Quick Actions',
        recentPatients: 'Recent Patients',
        seeAll: 'See All',
        systemStatus: 'System Status',
        online: 'Online Status',
        syncStatus: 'Sync Status',
        upToDate: 'Up to date',
        storage: 'Storage Used',
      },
      
      // Patients
      patients: {
        title: 'Patient Management',
        subtitle: 'Manage all patient records and information',
        addPatient: 'Add Patient',
        export: 'Export',
        searchPlaceholder: 'Search by name, phone number...',
        filters: 'Filters',
        noPatients: 'No patients found',
        noPatientsDesc: 'Add your first patient to get started',
        addFirstPatient: 'Add First Patient',
        showing: 'Showing',
        of: 'of',
        previous: 'Previous',
        next: 'Next',
      },
      
      // Appointments
      appointments: {
        title: 'Appointments',
        subtitle: 'Schedule and manage patient appointments',
        newAppointment: 'New Appointment',
        today: 'Today',
        todaysAppointments: "Today's Appointments",
        search: 'Search appointments...',
        filter: 'Filter',
        totalToday: 'Total Today',
        confirmed: 'Confirmed',
        waiting: 'Waiting',
        checkIn: 'Check In',
        reschedule: 'Reschedule',
        status: {
          confirmed: 'Confirmed',
          waiting: 'Waiting',
          pending: 'Pending',
        },
      },
      
      // Prescriptions
      prescriptions: {
        title: 'Prescriptions',
        subtitle: 'Create and manage patient prescriptions',
        newPrescription: 'New Prescription',
        searchPlaceholder: 'Search prescriptions...',
        filter: 'Filter',
        export: 'Export',
        medications: 'Medications',
        print: 'Print',
        edit: 'Edit',
        cancel: 'Cancel',
        quickCreate: 'Quick Prescription',
        selectPatient: 'Select Patient',
        commonMedications: 'Common Medications',
        instructions: 'Instructions',
        instructionsPlaceholder: 'Enter prescription instructions...',
        saveDraft: 'Save Draft',
        createPrescription: 'Create Prescription',
        status: {
          active: 'Active',
          completed: 'Completed',
        },
      },
      
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        patients: 'Patients',
        appointments: 'Appointments',
        prescriptions: 'Prescriptions',
        settings: 'Settings',
        logout: 'Logout',
      },
      
      // Footer
      footer: {
        rights: 'All rights reserved',
        offlineReady: 'Offline Ready',
      },
    },
  },
  kin: {
    translation: {
      // Common
      common: {
        save: 'Bika',
        cancel: 'Hagarika',
        delete: 'Siba',
        edit: 'Hindura',
        view: 'Reba',
        search: 'Shaka...',
        loading: 'Iyigiza...',
      },
      
      // Dashboard
      dashboard: {
        welcome: 'Murakaza neza',
        subtitle: 'Dore ibiri kuvugwa mu kigo cyawe uyu munsi',
        totalPatients: 'Abarwayi Bose',
        todayAppointments: 'Igihe cyagenwe uyu munsi',
        pendingPrescriptions: 'Impapuro zitegereje',
        waitingRoom: 'Icyicaro cyitegereje',
        notifications: 'Amatangazo',
        searchPlaceholder: 'Shaka abarwayi, igihe cyagenwe...',
        todaysSchedule: 'Igihe cyo uyu munsi',
        viewAll: 'Reba Byose',
        quickActions: 'Ibikorwa byihuse',
        recentPatients: 'Abarwayi baje vuba aha',
        seeAll: 'Reba Byose',
        systemStatus: 'Imiterere ya sisitemu',
        online: 'Imiterere ya interineti',
        syncStatus: 'Imiterere yo guhuza',
        upToDate: 'Byahuje',
        storage: 'Ububiko bukoreshwa',
      },
      
      // Patients
      patients: {
        title: 'Kuyobora Abarwayi',
        subtitle: 'Kuyobora amakuru yose y\'abarwayi',
        addPatient: 'Ongeraho Umurwayi',
        export: 'Sohera hanze',
        searchPlaceholder: 'Shaka ku izina, numero ya telefone...',
        filters: 'Icyiciro',
        noPatients: 'Nta barwayi babonetse',
        noPatientsDesc: 'Ongeraho umurwayi wa mbere kugirango utangire',
        addFirstPatient: 'Ongeraho Umurwayi wa Mbere',
        showing: 'Birangira',
        of: 'bya',
        previous: 'Ibanza',
        next: 'Ibikurikira',
      },
      
      // Appointments
      appointments: {
        title: 'Igihe cyagenwe',
        subtitle: 'Gahunda no kuyobora igihe cyagenwe',
        newAppointment: 'Igihe gishya',
        today: 'Uyu munsi',
        todaysAppointments: 'Igihe cyo uyu munsi',
        search: 'Shaka igihe cyagenwe...',
        filter: 'Icyiciro',
        totalToday: 'Byose uyu munsi',
        confirmed: 'Byemejwe',
        waiting: 'Bitegereje',
        checkIn: 'Andika',
        reschedule: 'Hindura igihe',
        status: {
          confirmed: 'Byemejwe',
          waiting: 'Bitegereje',
          pending: 'Bitegereje',
        },
      },
      
      // Prescriptions
      prescriptions: {
        title: 'Impapuro z\'ibiti',
        subtitle: 'Kora no kuyobora impapuro z\'ibiti',
        newPrescription: 'Impapuro nshya',
        searchPlaceholder: 'Shaka impapuro...',
        filter: 'Icyiciro',
        export: 'Sohera hanze',
        medications: 'Ibiti',
        print: 'Sohora',
        edit: 'Hindura',
        cancel: 'Hagarika',
        quickCreate: 'Impapuro yihuse',
        selectPatient: 'Hitamo umurwayi',
        commonMedications: 'Ibiti bikunze',
        instructions: 'Amabwiriza',
        instructionsPlaceholder: 'Andika amabwiriza y\'impapuro...',
        saveDraft: 'Bika ibyanditswe',
        createPrescription: 'Kora impapuro',
        status: {
          active: 'Akora',
          completed: 'Byakozwe',
        },
      },
      
      // Navigation
      nav: {
        dashboard: 'Urupapuro',
        patients: 'Abarwayi',
        appointments: 'Igihe cyagenwe',
        prescriptions: 'Impapuro z\'ibiti',
        settings: 'Igenamiterere',
        logout: 'Sohoka',
      },
      
      // Footer
      footer: {
        rights: 'Uburenganzira bwo kwagura',
        offlineReady: 'Biroroshye utarimo interneti',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;