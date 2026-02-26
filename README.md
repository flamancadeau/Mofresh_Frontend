# 🌿 MoFresh | Freshness Delivered

MoFresh is a modern, solar-powered cold supply chain marketplace connecting farmers, buyers, and logistics providers. This repository contains the frontend application built with React, TypeScript, and Vite.

## 🚀 Features

- **Role-Based Dashboards**: Tailored experiences for Buyers, Site Managers, Admins, and Suppliers.
- **Premium Authentication**: Secure, modal-style login and registration with OTP verification.
- **Real-Time Data**: Integrated with the MoFresh backend for live inventory, orders, and user management.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices.
- **Dark Mode**: Seamless support for both light and dark themes.
- **Internationalization**: Multi-language support (English/Kinyarwanda).

## 🛠 Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/mofresh/frontend.git
    cd mofresh-frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 📁 Project Structure

```
src/
├── api/             # API services and configuration
├── assets/          # Static assets (images, fonts)
├── components/      # Reusable UI components
│   ├── dashboard/   # Dashboard-specific components
│   ├── layout/      # Layout components (Navbar, Sidebar)
│   └── ui/          # Generic UI elements (Buttons, Inputs)
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization config
├── pages/           # Application pages (Login, Home, Dashboards)
├── store/           # Redux store setup
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## 🔌 API Integration

The application connects to the production backend at:
`https://mofresh-backend-production.up.railway.app/api/v1`

Key integrations included:
- **Authentication**: JWT-based auth with OTP flow.
- **Products**: Dynamic product fetching and filtering.
- **Carts**: Real-time cart management.
- **Users**: Profile management and updates.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is proprietary and confidential. Unauthorized copying of this file, via any medium is strictly prohibited.

---

**Developed with ❤️ for MoFresh**