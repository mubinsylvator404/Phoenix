
import React from 'react';
import { Teacher, Student } from './types';

export const TEACHERS: Teacher[] = [
  {
    id: 't1',
    name: 'Dr. Rafiqul Islam',
    subject: 'Physics',
    qualification: 'PhD in Theoretical Physics',
    experience: '15+ Years',
    image: 'https://picsum.photos/seed/dr-rafiq/200/200',
    education: 'University of Dhaka'
  },
  {
    id: 't2',
    name: 'Sarah Rahman',
    subject: 'Chemistry',
    qualification: 'M.Sc in Organic Chemistry',
    experience: '8 Years',
    image: 'https://picsum.photos/seed/sarah/200/200',
    education: 'Jahangirnagar University'
  },
  {
    id: 't3',
    name: 'Tanvir Ahmed',
    subject: 'Higher Math',
    qualification: 'M.Sc in Applied Mathematics',
    experience: '10 Years',
    image: 'https://picsum.photos/seed/tanvir/200/200',
    education: 'BUET'
  },
  {
    id: 't4',
    name: 'Kafi Al Fateha',
    subject: 'ICT',
    qualification: 'B.Sc in Engineering',
    experience: '5 Years',
    image: 'https://picsum.photos/seed/kafi/200/200',
    education: 'Shahjalal University of Science and Technology'
  },
  {
    id: 't5',
    name: 'KM Ahbab Zaman Aqib',
    subject: 'Biology',
    qualification: 'B.Sc in Agriculture',
    experience: '6 Years',
    image: 'https://picsum.photos/seed/ahbab/200/200',
    education: 'Sylhet Agricultural University'
  },
  {
    id: 't6',
    name: 'Hafijur Rahman Najim',
    subject: 'Chemistry',
    qualification: 'B.Sc in Chemistry',
    experience: '4 Years',
    image: 'https://picsum.photos/seed/najim/200/200',
    education: 'Jashore University of Science and Technology'
  },
  {
    id: 't7',
    name: 'Shafi Al Muntaha',
    subject: 'Physics',
    qualification: 'B.Sc in Engineering',
    experience: '4 Years',
    image: 'https://picsum.photos/seed/shafi/200/200',
    education: 'Sylhet Agricultural University'
  },
  {
    id: 't8',
    name: 'Abdullah Al Mubin',
    subject: 'English',
    qualification: 'BA in English',
    experience: '5 Years',
    image: 'https://picsum.photos/seed/mubin/200/200',
    education: 'Daffodil International University'
  },
  {
    id: 't9',
    name: 'Abdur Rahman Ruman',
    subject: 'Mathematics',
    qualification: 'B.Sc in EEE (Running)',
    experience: '4 Years',
    image: 'https://picsum.photos/seed/ruman/200/200',
    education: 'Chittagong University of Engineering and Technology (CUET)'
  }
];

// Generate some dummy dates for the last few days
const today = new Date();
const dates = Array.from({length: 5}, (_, i) => {
  const d = new Date();
  d.setDate(today.getDate() - i);
  return d.toISOString().split('T')[0];
});

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Arif Hossain',
    email: 'arif@student.com',
    phone: '+880 1711122233',
    password: 'password123',
    class: 'HSC 2nd Year',
    attendance: 85,
    averageScore: 78,
    assignments: 90,
    feesPaid: true,
    subjects: ['Physics', 'Chemistry', 'Higher Math'],
    isVerified: true,
    dailyAttendance: {
      [dates[0]]: true,
      [dates[1]]: true,
      [dates[2]]: false,
      [dates[3]]: true,
      [dates[4]]: true,
    }
  },
  {
    id: 's2',
    name: 'Nusrat Jahan',
    email: 'nusrat@student.com',
    phone: '+880 1811122233',
    password: 'password123',
    class: 'HSC 1st Year',
    attendance: 45,
    averageScore: 52,
    assignments: 30,
    feesPaid: false,
    subjects: ['Biology', 'ICT', 'Chemistry'],
    isVerified: true,
    dailyAttendance: {
      [dates[0]]: false,
      [dates[1]]: false,
      [dates[2]]: true,
      [dates[3]]: false,
      [dates[4]]: false,
    }
  }
];

export const SUBJECT_INFO = {
  'HSC Science Academic': { 
    icon: '🔬', 
    classesPerWeek: 12, 
    assignedTeachers: ['t1', 't2', 't3', 't5', 't6', 't7', 't9'],
    subSubjects: ['Physics', 'Chemistry', 'Higher Math', 'Biology']
  },
  'English & ICT': { icon: '📚', classesPerWeek: 4, assignedTeachers: ['t4', 't8'] }
};
