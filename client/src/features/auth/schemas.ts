import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email("Enter a valid email address")
        .required("Please enter your email"),
    password: Yup.string().required("Please enter your password"),
});

export const signupValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required("Please enter your name")
        .min(2, "Name must be at least 2 characters")
        .max(60, "Name should be no longer than 60 characters"),
    email: Yup.string()
        .trim()
        .email("Enter a valid email address")
        .required("Please enter your email"),
    phone: Yup.string()
        .trim()
        .required("Please enter your phone number")
        .matches(
            /^01[0-9]{9}$/,
            "Enter a valid 11-digit Egyptian phone number starting with 01"
        ),
    password: Yup.string()
        .required("Please create a password")
        .min(8, "Password must be at least 8 characters"),
    confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords do not match"),
});