import { useState } from 'react';
import { AlertTriangle, Mail, MapPin, Phone } from 'lucide-react';
import { submitContactForm } from '../lib/contactApi';
import { SITE_CONTACT } from '../lib/siteConfig';
import { getInitialMode, isPortfolioMode } from '../lib/appMode.js';

const VIBER_TEMPLATE_MESSAGE = `Hello MindCare Center, I'd like to ask about your mental health services.`;
const PHONE_COUNTRIES = [
  { code: 'PH', name: 'Philippines', dialCode: '+63' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'UK', name: 'United Kingdom', dialCode: '+44' },
];

const initialFormState = {
  fullName: '',
  email: '',
  phoneCountry: 'PH',
  phoneNationalNumber: '',
  inquiryType: '',
  preferredContactMethod: 'email',
  message: '',
  agreementCheckbox: false,
  company: '',
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhoneNationalNumber(phone) {
  return phone.replace(/\D/g, '');
}

function validateForm(values) {
  const nextErrors = {};
  const requiresPhone = values.preferredContactMethod === 'phone';

  if (!values.fullName.trim()) nextErrors.fullName = 'Full name is required.';
  if (!values.email.trim()) {
    nextErrors.email = 'Email is required.';
  } else if (!isValidEmail(values.email.trim())) {
    nextErrors.email = 'Please enter a valid email address.';
  }

  if (!values.inquiryType) nextErrors.inquiryType = 'Please select an inquiry type.';
  if (!values.preferredContactMethod) {
    nextErrors.preferredContactMethod = 'Please select a preferred contact method.';
  }
  if (requiresPhone && !values.phoneCountry) {
    nextErrors.phoneCountry = 'Please select a country code.';
  }
  if (requiresPhone) {
    if (!values.phoneNationalNumber.trim()) {
      nextErrors.phoneNationalNumber = 'Phone number is required when preferred contact method is phone.';
    } else {
      const normalized = normalizePhoneNationalNumber(values.phoneNationalNumber.trim());
      if (normalized.length < 6) {
        nextErrors.phoneNationalNumber = 'Please enter a valid phone number.';
      }
    }
  }
  if (!values.message.trim()) nextErrors.message = 'Message is required.';
  if (!values.agreementCheckbox) {
    nextErrors.agreementCheckbox = 'You must confirm this form is not for emergencies.';
  }

  return nextErrors;
}

export default function Contact() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [appMode] = useState(getInitialMode());
  const isPortfolio = isPortfolioMode(appMode);
  const viberHref = `viber://chat?number=${encodeURIComponent(SITE_CONTACT.phoneE164)}&text=${encodeURIComponent(VIBER_TEMPLATE_MESSAGE)}`;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (name === 'preferredContactMethod' && nextValue !== 'phone') {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.preferredContactMethod;
        delete next.phoneCountry;
        delete next.phoneNationalNumber;
        return next;
      });
      return;
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setIsSuccess(false);

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    if (formData.company.trim()) {
      setIsSuccess(true);
      setFormData(initialFormState);
      return;
    }

    if (isPortfolio) {
      setIsSuccess(true);
      setFormData(initialFormState);
      setErrors({});
      return;
    }

    const selectedCountry = PHONE_COUNTRIES.find(
      (country) => country.code === formData.phoneCountry,
    );
    const normalizedPhone = normalizePhoneNationalNumber(formData.phoneNationalNumber.trim());
    const hasPhoneInput = normalizedPhone.length > 0;
    const composedPhone = hasPhoneInput && selectedCountry
      ? `${selectedCountry.dialCode}${normalizedPhone}`
      : '';

    setIsSubmitting(true);

    try {
      await submitContactForm({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: composedPhone,
        phoneCountry: selectedCountry?.code ?? '',
        phoneCountryDialCode: selectedCountry?.dialCode ?? '',
        phoneNationalNumber: normalizedPhone,
        inquiryType: formData.inquiryType,
        preferredContactMethod: formData.preferredContactMethod,
        message: formData.message.trim(),
        submittedAt: new Date().toISOString(),
        source: 'website-contact-form',
      });

      setIsSuccess(true);
      setFormData(initialFormState);
      setErrors({});
    } catch {
      setSubmitError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Reach Out — We’re Here to Help
          </h1>
          <p className="mt-4 text-body text-slate-600">
            Taking the first step can feel difficult. Share your concerns with us,
            and our team will guide you toward compassionate, professional support.
          </p>
          {isPortfolio && (
            <p className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 backdrop-blur-sm">
              Portfolio mode notice: You can submit this form for demonstration, but it will not send data to a live clinical service.
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 md:p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Contact Form</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill out the form below and we will reply as soon as possible.
            </p>

            {isSuccess && (
              <p
                className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                role="status"
                aria-live="polite"
              >
                {isPortfolio
                  ? 'thank you for sumbitting your response - please note this functionality is currently disabled.'
                  : 'Thank you for reaching out. Our team will respond within 24 hours. If your matter is urgent, please contact emergency services.'}
              </p>
            )}

            {submitError && (
              <p
                className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                role="alert"
              >
                {submitError}
              </p>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
                    Full Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  {errors.fullName && (
                    <p id="fullName-error" className="mt-1 text-sm text-rose-600">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                    Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-rose-600">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Phone Number {formData.preferredContactMethod === 'phone' ? <span aria-hidden="true">*</span> : '(Optional)'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label htmlFor="phoneCountry" className="sr-only">Country Code</label>
                      <select
                        id="phoneCountry"
                        name="phoneCountry"
                        value={formData.phoneCountry}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.phoneCountry)}
                        aria-describedby={errors.phoneCountry ? 'phoneCountry-error' : undefined}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required={formData.preferredContactMethod === 'phone'}
                      >
                        {PHONE_COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.code} {country.dialCode}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="phoneNationalNumber" className="sr-only">Phone Number</label>
                      <input
                        id="phoneNationalNumber"
                        name="phoneNationalNumber"
                        type="tel"
                        autoComplete="tel-national"
                        value={formData.phoneNationalNumber}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.phoneNationalNumber)}
                        aria-describedby={errors.phoneNationalNumber ? 'phoneNationalNumber-error' : undefined}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="9123456789"
                        required={formData.preferredContactMethod === 'phone'}
                      />
                    </div>
                  </div>
                  {formData.preferredContactMethod === 'phone' && (
                    <p className="mt-1 text-xs text-slate-500">
                      Required because you selected phone as your preferred contact method.
                    </p>
                  )}
                  {errors.phoneCountry && (
                    <p id="phoneCountry-error" className="mt-1 text-sm text-rose-600">
                      {errors.phoneCountry}
                    </p>
                  )}
                  {errors.phoneNationalNumber && (
                    <p id="phoneNationalNumber-error" className="mt-1 text-sm text-rose-600">
                      {errors.phoneNationalNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="inquiryType" className="mb-1 block text-sm font-medium text-slate-700">
                    Inquiry Type <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.inquiryType)}
                    aria-describedby={errors.inquiryType ? 'inquiryType-error' : undefined}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">Select inquiry type</option>
                    <option value="therapy">Therapy</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="general question">General Question</option>
                  </select>
                  {errors.inquiryType && (
                    <p id="inquiryType-error" className="mt-1 text-sm text-rose-600">
                      {errors.inquiryType}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="preferredContactMethod" className="mb-1 block text-sm font-medium text-slate-700">
                  Preferred Contact Method <span aria-hidden="true">*</span>
                </label>
                <select
                  id="preferredContactMethod"
                  name="preferredContactMethod"
                  value={formData.preferredContactMethod}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.preferredContactMethod)}
                  aria-describedby={errors.preferredContactMethod ? 'preferredContactMethod-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 md:max-w-xs"
                  required
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
                {errors.preferredContactMethod && (
                  <p id="preferredContactMethod-error" className="mt-1 text-sm text-rose-600">
                    {errors.preferredContactMethod}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700">
                  Message <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
                {errors.message && (
                  <p id="message-error" className="mt-1 text-sm text-rose-600">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="hidden" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  tabIndex="-1"
                  autoComplete="off"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="flex items-start gap-3 text-sm text-slate-700" htmlFor="agreementCheckbox">
                  <input
                    id="agreementCheckbox"
                    name="agreementCheckbox"
                    type="checkbox"
                    checked={formData.agreementCheckbox}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.agreementCheckbox)}
                    aria-describedby={errors.agreementCheckbox ? 'agreementCheckbox-error' : undefined}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                    required
                  />
                  <span>
                    I understand this form is not for emergency use. If I am in immediate danger,
                    I will contact local emergency services.
                  </span>
                </label>
                {errors.agreementCheckbox && (
                  <p id="agreementCheckbox-error" className="mt-1 text-sm text-rose-600">
                    {errors.agreementCheckbox}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">What Happens Next</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>We review your message and route it to the right care team.</li>
                <li>You receive a confirmation by email shortly after submission.</li>
                <li>A team member responds within 24 hours with next steps.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-semibold text-amber-900">Crisis Notice</h2>
                  <p className="mt-2 text-sm text-amber-800">
                    This form is not monitored 24/7 and should not be used for urgent or life-threatening
                    situations. If you are in crisis, contact emergency services immediately.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Alternate Contact Info</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  <a
                    href={viberHref}
                    className="underline decoration-primary/40 underline-offset-2 transition hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Contact us on Viber"
                  >
                    {SITE_CONTACT.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  <a
                    href={`mailto:${SITE_CONTACT.email}`}
                    className="underline decoration-primary/40 underline-offset-2 transition hover:text-primary"
                  >
                    {SITE_CONTACT.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  <a
                    href={SITE_CONTACT.mapUrl}
                    className="underline decoration-primary/40 underline-offset-2 transition hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open address in Google Maps"
                  >
                    {SITE_CONTACT.address}
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
