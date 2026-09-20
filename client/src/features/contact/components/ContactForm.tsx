import { useState } from "react";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import { CONTACT_SUBJECTS } from "../data";
import { contactValidationSchema } from "../schemas";
import type { ContactFormValues } from "../types";

const initialValues: ContactFormValues = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
};

const FIELD_CLASS_NAME =
    "w-full rounded-lg border bg-primary px-4 py-3 text-sm text-secondary outline-none transition-colors duration-200 placeholder:text-muted-foreground/70 focus:border-brand focus:ring-2 focus:ring-brand/30";

const fieldClassName = (hasError: boolean) =>
    `${FIELD_CLASS_NAME} ${hasError ? "border-red-500" : "border-border"}`;

const ERROR_CLASS_NAME = "mt-1.5 text-xs font-medium text-red-500";

const ContactForm = () => {
    const [submitted, setSubmitted] = useState(false);

    const formik = useFormik<ContactFormValues>({
        initialValues,
        validationSchema: contactValidationSchema,
        onSubmit: (_, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            window.setTimeout(() => {
                setSubmitting(false);
                setSubmitted(true);
                resetForm();
                window.setTimeout(() => setSubmitted(false), 5000);
            }, 800);
        },
    });

    return (
        <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5 shadow-md sm:p-7"
        >
            <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold uppercase tracking-tight text-secondary">
                    Send us a message
                </h2>
                {submitted && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                        <CheckCircleIcon className="w-4" />
                        Message sent
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="name"
                        className="text-xs font-semibold uppercase tracking-wide text-secondary"
                    >
                        Full Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        autoComplete="name"
                        className={fieldClassName(
                            Boolean(formik.touched.name && formik.errors.name)
                        )}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.name}
                    />
                    {formik.touched.name && formik.errors.name && (
                        <p className={ERROR_CLASS_NAME} role="alert">
                            {formik.errors.name}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="phone"
                        className="text-xs font-semibold uppercase tracking-wide text-secondary"
                    >
                        Phone
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="01000000000"
                        autoComplete="tel"
                        inputMode="numeric"
                        maxLength={11}
                        dir="ltr"
                        className={fieldClassName(
                            Boolean(formik.touched.phone && formik.errors.phone)
                        )}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.phone}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                        <p className={ERROR_CLASS_NAME} role="alert">
                            {formik.errors.phone}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="email"
                        className="text-xs font-semibold uppercase tracking-wide text-secondary"
                    >
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        autoComplete="email"
                        dir="ltr"
                        className={fieldClassName(
                            Boolean(formik.touched.email && formik.errors.email)
                        )}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <p className={ERROR_CLASS_NAME} role="alert">
                            {formik.errors.email}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="subject"
                        className="text-xs font-semibold uppercase tracking-wide text-secondary"
                    >
                        Subject
                    </label>
                    <div className="relative">
                        <select
                            id="subject"
                            name="subject"
                            className={`${fieldClassName(
                                Boolean(formik.touched.subject && formik.errors.subject)
                            )} cursor-pointer appearance-none pr-10`}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.subject}
                        >
                            <option value="" disabled>
                                Choose a subject
                            </option>
                            {CONTACT_SUBJECTS.map((subject) => (
                                <option key={subject} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {formik.touched.subject && formik.errors.subject && (
                        <p className={ERROR_CLASS_NAME} role="alert">
                            {formik.errors.subject}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="message"
                    className="text-xs font-semibold uppercase tracking-wide text-secondary"
                >
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Tell us how we can help…"
                    className={`${fieldClassName(
                        Boolean(formik.touched.message && formik.errors.message)
                    )} resize-none`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.message}
                />
                {formik.touched.message && formik.errors.message && (
                    <p className={ERROR_CLASS_NAME} role="alert">
                        {formik.errors.message}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-opacity duration-200 outline-none hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {formik.isSubmitting ? "Sending…" : "Send message"}
                </button>
                {submitted && (
                    <p className="text-center text-sm font-medium text-green-600 dark:text-green-400">
                        Thanks for reaching out! We'll get back to you soon.
                    </p>
                )}
            </div>
        </form>
    );
};

export default ContactForm;