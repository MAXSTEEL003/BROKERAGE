app/
├── api/                  # API routes
│   └── export/           # Export API routes
│       └── route.ts      # Export API handler
├── components/           # React components
│   ├── ui/               # UI components
│   │   ├── Button.tsx    # Button component
│   │   ├── Card.tsx      # Card component
│   │   ├── Input.tsx     # Input component
│   │   └── Select.tsx    # Select component
│   ├── DataPreview.tsx   # Data preview component
│   ├── ExcelImport.tsx   # Excel import component
│   ├── FilterControls.tsx # Filter controls component
│   └── ResultDisplay.tsx  # Result display component
├── hooks/                # Custom React hooks
│   ├── useExcelData.ts   # Hook for Excel data handling
│   └── useCalculator.ts  # Hook for calculation logic
├── lib/                  # Utility functions and libraries
│   ├── excel.ts          # Excel processing utilities
│   ├── pdf.ts            # PDF generation utilities
│   └── utils.ts          # General utilities
├── styles/               # Global styles
│   └── calculator.css    # Calculator styles
├── types/                # TypeScript type definitions
│   └── index.ts          # Type definitions
├── error.tsx             # Error page
├── favicon.ico           # Favicon
├── globals.css           # Global CSS
├── layout.tsx            # Root layout
├── loading.tsx           # Loading page
├── not-found.tsx         # 404 page
└── page.tsx              # Home page