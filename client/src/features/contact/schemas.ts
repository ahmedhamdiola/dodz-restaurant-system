import * as Yup from "yup";

export const contactValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required("Please enter your name")
        .max(60, "Name should be no longer than 60 characters"),
    email: Yup.string()
        .trim()
        .email("Enter a valid email address")
        .matches(
            /@(gmail\.com|hotmail\.com|yahoo\.com)$/i,
            "Email must use a Gmail, Hotmail, or Yahoo address"
        )
        .required("Please enter your email"),
    phone: Yup.string()
        .trim()
        .required("Please enter your phone number")
        .matches(/^01[0-9]{9}$/, "Phone number must start with 01 and be exactly 11 digits"),
    subject: Yup.string().required("Please choose a subject"),
    message: Yup.string()
        .trim()
        .min(10, "Message should be at least 10 characters")
        .max(2000, "Message should be no longer than 2000 characters")
        .required("Please write your message"),
});