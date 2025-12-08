# StillLift - Next.js + shadcn/ui + Tailwind CSS

A modern, beautiful web application built with Next.js 15, shadcn/ui components, and Tailwind CSS.

## 🚀 Tech Stack

- **Next.js 15** - React framework with App Router and Server Components
- **shadcn/ui** - Beautiful, accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **ESLint** - Code linting and formatting

## ✨ Features

- 🎨 Modern, responsive design with dark mode support
- 🧩 Pre-built shadcn/ui components (Button, Card, Input, Label)
- 📱 Mobile-first responsive layout
- 🌙 Dark/light theme support
- ⚡ Fast development with hot reload
- 🔧 TypeScript for better developer experience

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd stilllift_new
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
stilllift_new/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   └── ui/             # shadcn/ui components
│   └── lib/                # Utility functions
├── public/                 # Static assets
├── components.json         # shadcn/ui configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json           # Dependencies and scripts
```

## 🎨 Available Components

The project includes these shadcn/ui components:

- **Button** - Various button styles and variants
- **Card** - Content containers with header, content, and footer
- **Input** - Form input fields
- **Label** - Form labels with accessibility features

### Adding More Components

To add more shadcn/ui components:

```bash
npx shadcn@latest add <component-name>
```

For example:
```bash
npx shadcn@latest add dialog dropdown-menu
```

## 🎯 Customization

### Colors and Themes

The project uses Tailwind CSS with a neutral color palette. You can customize colors in:

- `src/app/globals.css` - CSS variables for theming
- `tailwind.config.ts` - Tailwind configuration

### Styling

- Use Tailwind CSS utility classes for styling
- shadcn/ui components are styled with CSS variables
- Dark mode is automatically supported

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com) - Headless UI primitives

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using Next.js, shadcn/ui, and Tailwind CSS
