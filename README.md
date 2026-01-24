
# MedPath

**Your Health Journey, Simplified.**

MedPath is an intelligent healthcare platform that connects patients with verified doctors, provides AI-powered health assessments, and facilitates seamless appointment booking.

## Live Demo

[https://diagnosify-gamma.vercel.app](https://medpath-gamma.vercel.app)

## Features

### For Patients
*   **🤖 AI Health Assessment**: Describe your symptoms to receive an instant, AI-powered preliminary evaluation and risk analysis.
*   **🩺 Find Specialists**: Discover nearby doctors and hospitals tailored to your specific health needs.
*   **📅 Instant Booking**: Schedule appointments directly with doctors without phone calls.
*   **💬 Secure Communication**: Chat and video consults (coming soon) with your healthcare providers.

### For Doctors
*   **🏥 Practice Management**: Efficiently manage appointments and patient queries.
*   **🤝 Patient Connection**: Connect with new patients matching your specialty.
*   **📊 Dashboard**: Comprehensive view of your schedule and patient history.

### For Admins
*   **🛡️ User & Doctor Management**: Verify doctors, manage user accounts, and handle platform access.
*   **🧠 AI Diagnosis Review**: Monitor and review AI-generated health assessments for quality assurance.
*   **📈 Analytics & Audit Logs**: Track platform usage statistics and view detailed system activity logs.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Language**: JavaScript
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   **Database**: [Neon](https://neon.tech/) (PostgreSQL)
*   **AI**: [Vercel AI SDK](https://sdk.vercel.ai/docs)
*   **Authentication**: Custom / NextAuth (Configuration dependent)

## Getting Started

### Prerequisites
*   Node.js 18+
*   pnpm (recommended) or npm/yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd MedPath-app
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add the necessary environment variables (Database URL, OpenAI API Key, etc.).

4.  **Run the development server**
    ```bash
    pnpm dev
    # or
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## 👨💻 Author

**Avinash Yadav**
Full-Stack Developer
Passionate about real-world scalable applications.

## 📜 License

MIT License — Free to use, modify, and distribute.
