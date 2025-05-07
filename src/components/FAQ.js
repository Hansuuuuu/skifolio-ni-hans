import React, { useState } from "react";
import "../styles.css";

const FAQ = ({ userType }) => {
  const applicantFaqs = [
    {
      question: "How do I create an account?",
      answer:
        "Click Sign Up and choose Applicant. Fill in your details to register.",
    },
    {
      question: "How do I apply for a job?",
      answer:
        "Use the 'Search Jobs' feature to browse listings and apply with your portfolio.",
    },
    {
      question: "How do I update my profile?",
      answer:
        "Go to the 'Profile' page from the navigation bar and click edit.",
    },
    {
      question: "What is 'Get Discovered'?",
      answer:
        "This feature boosts your visibility to employers based on your skills.",
    },
  ];

  const employerFaqs = [
    {
      question: "How do I register as an employer?",
      answer:
        "Click Sign Up and choose Employer. Fill out your company and contact info.",
    },
    {
      question: "How do I post a job?",
      answer:
        "Navigate to the 'Post Job' section and fill in the job posting form.",
    },
    {
      question: "How do I filter applicants?",
      answer:
        "Go to 'Discover' and use the skill-based filters to find ideal candidates.",
    },
    {
      question: "How do notifications work?",
      answer:
        "You'll be alerted when an applicant interacts with your job post.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const faqs = userType === "employer" ? employerFaqs : applicantFaqs;

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mt-5 pt-5">
      <h2 className="mb-4">Frequently Asked Questions</h2>
      <div className="accordion">
        {faqs.map((faq, index) => (
          <div className="accordion-item" key={index}>
            <h2 className="accordion-header">
              <button
                className={`accordion-button ${
                  openIndex === index ? "" : "collapsed"
                }`}
                type="button"
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
              </button>
            </h2>
            <div
              className={`accordion-collapse collapse ${
                openIndex === index ? "show" : ""
              }`}
            >
              <div className="accordion-body">{faq.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;