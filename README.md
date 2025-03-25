TaskFlow is a clean, smart, and responsive to-do list web app that helps you stay organized across all your devices.
It supports task prioritization, subtasks, recurring tasks, and more — all synced in real-time with Firebase Firestore!

---

## 🌟 Features

- ✅ Add tasks with **priority**, **due date/time**, and **category**
- 🔁 Support for **recurring tasks** (daily, weekly, monthly)
- 📌 Organize tasks into projects: General, Work, Personal, Shopping
- 📅 **Calendar view** to see upcoming tasks
- 📋 **Subtask support** (add subtasks to main tasks)
- 🔔 **Reminders** with sound notifications
- 🌙 **Dark mode** toggle
- 🔄 **Cloud sync** with Firebase (Firestore)
- 📲 Installable as a **Progressive Web App (PWA)**

---

## 🚀 How to Use

### 🔧 Development Setup

1. Clone or download the repository.

2. Open `index.html` in a browser (Live Server recommended).

3. Tasks are saved locally and synced with Firebase.

### 🛠 Firebase Integration

Firebase is used to sync tasks across devices in real-time using Firestore.

- Firebase services used:
  - Firestore (Database)
  - Analytics

- You can customize the Firebase config in the `<script>` section of `index.html` or `script.js`.

---

## 📦 Deployment

TaskFlow can be hosted on any static web hosting platform:

- GitHub Pages
- Firebase Hosting
- Netlify / Vercel
- Surge / Render

---

## 📱 Installation (PWA)

TaskFlow is a Progressive Web App (PWA). To install:

- Open the app in Chrome or Safari.
- Click the “Install” option in the address bar or browser menu.
- The app will be added to your Home Screen or Desktop.

---

## 🧠 Tech Stack

- HTML5, CSS3, JavaScript (ES6+)
- Firebase (Firestore, Analytics)
- PWA (Manifest + Service Worker)

---

## 🙌 Credits

Developed with 💚 by [Pawan Kumari]

---

## 📃 License

This project is licensed under the MIT License. See `LICENSE` for more details.
"""

# Save the README content to a file

readme_path = "/mnt/data/README.md"
with open(readme_path, "w", encoding="utf-8") as f:
    f.write(readme_content)

readme_path
