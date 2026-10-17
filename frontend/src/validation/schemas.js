import { z } from 'zod';

export const hospitalRegistrationSchema = z.object({
  hospital_name: z.string().min(3, 'Hospital name must be at least 3 characters'),
  registration_number: z.string().min(3, 'Registration number is required'),
  hospital_type: z.string().min(2, 'Hospital type is required'),
  specializations: z.string().min(3, 'Specializations are required'),
  address: z.string().min(5, 'Full street address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{4,10}$/, 'Valid PIN/Postal code is required'),
  contact_number: z.string().min(7, 'Valid contact number is required'),
  official_email: z.string().email('Valid official email address is required'),
  doctor_in_charge: z.string().min(3, 'Doctor-in-charge name is required'),
  facilities: z.string().min(3, 'Facilities description is required'),
  license_number: z.string().min(3, 'License number is required'),
  email: z.string().email('Valid login email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const patientRegistrationSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  date_of_birth: z.string().optional().or(z.literal('')),
  phone: z.string().min(7, 'Valid contact phone number is required'),
  email: z.string().email('Valid email address is required'),
  address: z.string().min(5, 'Residential address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{4,10}$/, 'Valid PIN/Postal code is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const recordFormSchema = z.object({
  hospital_name: z.string().min(3, 'Hospital name is required'),
  registration_number: z.string().min(2, 'Registration number is required'),
  hospital_type: z.string().min(2, 'Hospital type is required'),
  specializations: z.string().min(3, 'Specializations are required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{4,10}$/, 'Valid PIN/Postal code is required'),
  contact_number: z.string().min(7, 'Contact number is required'),
  official_email: z.string().email('Valid official email is required'),
  doctor_in_charge: z.string().min(3, 'Doctor-in-charge is required'),
  facilities: z.string().min(3, 'Facilities are required'),
  license_number: z.string().min(2, 'License number is required'),
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'New passwords do not match',
  path: ['confirm_password'],
});
