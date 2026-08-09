# ✨ AI-Powered Image Background Remover

A premium, modern web application that removes backgrounds from images **100% locally** in the browser using WebAssembly and ONNX Runtime. No servers, no APIs, no token limits, and complete privacy.

🔗 **Live Demo:** [image-background-remover-theta-drab.vercel.app](https://image-background-remover-theta-drab.vercel.app)

---

## 🌟 Key Features

*   **⚡ 100% Local AI Processing:** Powered by `@imgly/background-removal` running via WebAssembly (WASM). Your photos are processed directly on your device CPU/GPU.
*   **🔒 Zero Server Uploads (Privacy First):** Your images never leave your computer. Perfect for sensitive or personal files.
*   **💰 Completely Free & Unlimited:** No credits, no subscriptions, and no registration. Process as many images as you need.
*   **📸 Camera Integration:** Take pictures directly using your mobile phone or laptop camera and strip the backgrounds instantly.
*   **🎨 Pro Design Canvas:**
    *   **Custom Backgrounds:** Choose transparent backgrounds, solid colors, modern HSL gradients, or upload your own background images.
    *   **Subject Editing:** Scale, rotate, reposition, or flip your subject image with ease.
    *   **Aesthetics & Filters:** Apply adjustments like brightness, contrast, and saturation.
    *   **Subject Effects:** Add custom customizable **Drop Shadows** (blur, offset, color) or **Outline Strokes** to make your subjects pop.
*   **↔️ Before/After Slider:** Compare your original upload with the isolated AI output side-by-side using an interactive slider.
*   **📜 Session History:** Keep track of all processed images in the sidebar for quick edits and batch comparison.
*   **💾 High-Quality Export:** Save your final compositions in PNG or JPEG format with custom quality sliders.

---

## 🛠️ Technology Stack

*   **Framework:** [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
*   **AI Engine:** [@imgly/background-removal](https://www.npmjs.com/package/@imgly/background-removal) (WebAssembly + ONNX Runtime Web)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Styling:** Custom Vanilla CSS (featuring rich glassmorphism, responsive grid layouts, custom scrollbars, and micro-interactions)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ShreyashWeb/Image-Background-Remover.git
   cd Image-Background-Remover
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

To build the static production bundle:
```bash
npm run build
```
Vite will compile all assets, including the WebAssembly files, into the `dist/` directory.

---

## ⚙️ How it Works under the Hood

When you drop an image into the application:
1. **Model Fetching:** The first time you use the app, the library downloads the pre-trained neural network model (approx. 24MB) into your browser's Cache Storage.
2. **Local Inference:** It uses ONNX Runtime Web via WebAssembly. The model analyzes the image, creates a segmentation mask, and isolates the subject.
3. **Canvas Drawing:** The React application draws the resulting transparent subject on an HTML5 canvas alongside any background layer, filter effects, outlines, or drop shadows you configure in the **Control Panel**.
4. **Hardware Acceleration:** Uses WebGL/WebGPU when available, falling back to a highly optimized single-threaded CPU mode if your browser doesn't support multithreading headers.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
