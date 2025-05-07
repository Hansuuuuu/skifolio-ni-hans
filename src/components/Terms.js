import React from 'react';

const Terms = ({ onAgree, onClose, isModal = false }) => {
  const effectiveDate = new Date('2024-11-15').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing or using Skifolio, you agree to be bound by these Terms and Conditions. If you do not agree, please do not register, use, or access our services."
    },
    {
      title: "2. Account Eligibility",
      content: "You must be at least 13 years old to create an account. Employers must submit valid business documents to verify company identity."
    },
    {
      title: "3. Account Responsibilities",
      content: "Keep your login credentials secure and confidential. Immediately report unauthorized access or breaches. You are responsible for all activities that occur under your account.",
      list: true
    },
    {
      title: "4. User Conduct",
      content: "You agree not to:",
      listItems: [
        "Upload false or misleading information.",
        "Use Skifolio for unlawful or abusive purposes.",
        "Violate intellectual property rights of others."
      ]
    },
    {
      title: "5. Content Ownership",
      content: "All content you upload remains your intellectual property. By submitting content to Skifolio, you grant us a license to display and share it within the scope of the platform's purpose."
    },
    {
      title: "6. Employer Verification",
      content: "Employers must upload valid business permits and company details. These documents are reviewed and stored securely for verification purposes."
    },
    {
      title: "7. Account Approval",
      content: "All accounts are subject to verification and approval. Skifolio reserves the right to reject or suspend accounts that do not meet platform standards or violate these terms."
    },
    {
      title: "8. Termination",
      content: "We may suspend or terminate your account for violations of these Terms, misuse of the platform, or at our discretion with or without prior notice."
    },
    {
      title: "9. Limitation of Liability",
      content: "Skifolio is provided \"as is\" and we make no warranties regarding its accuracy, security, or availability. We are not liable for any indirect or consequential damages arising from the use of our platform."
    },
    {
      title: "10. Changes to Terms",
      content: "We may revise these Terms at any time. Continued use of Skifolio constitutes acceptance of the updated terms. We encourage users to review this page regularly."
    },
    {
      title: "11. Contact Us",
      content: "For questions or concerns regarding these Terms, please contact us at support@skifolio.com.",
      hasEmail: true
    }
  ];

  const contentClass = isModal ? "max-h-96 overflow-y-auto pr-2" : "";

  return (
    <div className={`${isModal ? 'w-full' : 'max-w-4xl mx-auto'} bg-gray-50 rounded-xl shadow-md p-8 md:p-12`}>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">Terms and Conditions</h1>
        <p className="text-center italic text-gray-500 mt-2">
          Effective Date: {effectiveDate}
        </p>
        <hr className="my-8 border-t border-gray-200" />
      </header>
      
      <div className={`space-y-8 ${contentClass}`}>
        {sections.map((section, index) => (
          <section key={index} className="pb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-3">{section.title}</h2>
            
            {!section.listItems && !section.list && (
              <p className="text-gray-600 leading-relaxed">
                {section.content}
                {section.hasEmail && (
                  <a href="mailto:support@skifolio.com" className="text-blue-600 hover:text-blue-800 underline">
                    support@skifolio.com
                  </a>
                )}
              </p>
            )}
            
            {section.list && (
              <ul className="list-disc pl-5 text-gray-600 leading-relaxed">
                <li>Keep your login credentials secure and confidential.</li>
                <li>Immediately report unauthorized access or breaches.</li>
                <li>You are responsible for all activities that occur under your account.</li>
              </ul>
            )}
            
            {section.listItems && (
              <>
                <p className="text-gray-600 mb-2">{section.content}</p>
                <ul className="list-disc pl-5 text-gray-600 leading-relaxed">
                  {section.listItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        ))}
      </div>
      
      {isModal && (
        <div className="mt-8 flex justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Close
          </button>
          <button 
            onClick={onAgree}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            I Agree
          </button>
        </div>
      )}
      
      <footer className="mt-12 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Skifolio. All rights reserved.
      </footer>
    </div>
  );
};

export default Terms;