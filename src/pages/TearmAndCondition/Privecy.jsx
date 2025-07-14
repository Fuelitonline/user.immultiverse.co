import React from 'react';
import './tearm.css'
function PrivacyPolicy() {
  return (
    <div className="terms-container">
      <div className="terms-header">
        <h1>Privacy Policy</h1>
        <p className="updated-date">Last Updated: October 12, 2024</p>
      </div>

      <section className="intro">
        <p>
          Welcome to Multiverse, a platform operated by FUELITONLINE. We value your privacy and are committed to protecting your personal information. This Privacy Policy outlines the types of data we collect, how we use it, and how we protect your information. By using our Services, you consent to the practices described in this policy.
        </p>
      </section>

      <section>
        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Personal Information:</strong> We may collect your name, email address, phone number, and other personal details when you register or interact with our platform.</li>
          <li><strong>Usage Data:</strong> We collect information about how you use our services, including browsing activities, device information, and location data.</li>
          <li><strong>Cookies:</strong> We use cookies to enhance user experience and analyze website usage.</li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain our Services.</li>
          <li>To improve the functionality and usability of our platform.</li>
          <li>To communicate with you about account updates, offers, and support.</li>
          <li>To ensure security and protect against fraudulent activity.</li>
        </ul>
      </section>

      <section>
        <h2>3. Data Protection and Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure. We strive to protect your data, but we cannot guarantee its absolute security.
        </p>
      </section>

      <section>
        <h2>4. Your Rights</h2>
        <ul>
          <li>You have the right to access, update, or delete your personal information at any time.</li>
          <li>You can opt-out of marketing communications by clicking the unsubscribe link in emails.</li>
          <li>You can request the deletion of your account by contacting us directly.</li>
        </ul>
      </section>

      <section>
        <h2>5. Third-Party Services</h2>
        <p>
          We may share your data with third-party service providers for the purposes of providing and improving our services. These third parties are obligated to protect your data and are not authorized to use it for other purposes.
        </p>
      </section>

      <section>
        <h2>6. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we make changes, we will update the date at the top of this page and notify you through email or in-app notifications. Continued use of our services after such changes will signify your acceptance of the updated policy.
        </p>
      </section>

      <footer>
        <p>If you have any questions about this Privacy Policy, please contact us at <strong>support@fuelitonline.com</strong>.</p>
      </footer>
    </div>
  );
}

export default PrivacyPolicy;
