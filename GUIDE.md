# CampusCrave PU Goa: Hackathon Collaboration Guide

Welcome to the **CampusCrave** project! This guide is designed to help a team of 4 participants collaborate effectively using GitHub while working on distinct niches within the application.

## 🚀 Project Overview
**CampusCrave** is an e-canteen solution specifically designed for the **Parul University Goa Campus**. It streamlines ordering, manages canteen queues, and allows students to book seats for a seamless dine-in experience.

---

## 👥 Participant Niche Breakdown

### 1. Frontend & UI Specialist (The Architect)
*   **Focus**: User Interface, Design System, and Animations.
*   **Key Responsibilities**:
    *   Create reusable components in `src/components/ui`.
    *   Design the Layout and branding in `src/App.tsx` and `src/index.css`.
    *   Implement smooth transitions using `motion/react`.
    *   **Main Files**: `src/components/Layout.tsx`, `src/components/Common/`, `src/styles/`.

### 2. Digital Storefront & State Lead (The Flow Manager)
*   **Focus**: Menu browsing, Cart logic, and Order flow.
*   **Key Responsibilities**:
    *   Implement the product listing and filtering (Categorized Menu).
    *   Manage the shopping cart state.
    *   Design the checkout experience.
    *   **Main Files**: `src/pages/Storefront.tsx`, `src/hooks/useCart.ts`, `src/components/ProductCard.tsx`.

### 3. Backend & Data API Dev (The Engine Builder)
*   **Focus**: Server logic, Queue management, and Database structure.
*   **Key Responsibilities**:
    *   Maintain the Express server in `server.ts`.
    *   Create API endpoints for Orders, Queue status, and Seat Availability.
    *   Simulate/Integrate real-time status updates for the queue.
    *   **Main Files**: `server.ts`, `src/services/api.ts`.

### 4. Smart Systems & Security Lead (The Innovation Driver)
*   **Focus**: Seat Pre-booking, Queue UI, AI Features, and Authentication.
*   **Key Responsibilities**:
    *   Build the Seat Reservation system with a visual selector.
    *   Implement the live Queue tracking view.
    *   Integrate Gemini AI for "Crave Suggestions" based on mood/time.
    *   **Authentication & Security**: Implement Firebase Auth (Email/Phone) and secure Firestore data using Rules.
    *   **Main Files**: `src/pages/Booking.tsx`, `src/pages/QueueStatus.tsx`, `src/services/geminiService.ts`, `src/lib/firebase.ts`, `firestore.rules`.

---

## 🛠 Collaboration via GitHub

1.  **Main Branch**: Keep `main` stable. Never push broken code to `main`.
2.  **Feature Branches**: Each niche worker should create a branch for their feature:
    *   `feat/frontend-ui`
    *   `feat/storefront-logic`
    *   `feat/backend-api`
    *   `feat/smart-booking`
3.  **Pull Requests (PRs)**: Submit PRs to `main`. Have at least one other teammate review the code.
4.  **Syncing**: Regularly run `git pull origin main` to stay updated with your teammate's changes.

## 🎯 Hackathon Goals
- **Milestone 1**: Basic Menu Display & Cart.
- **Milestone 2**: Order placement and basic Queue tracking.
- **Milestone 3**: Seat booking UI and backend integration.
- **Milestone 4**: Polished UI with Animations and AI Crave Suggestion.

Good luck, Team! Let's build the future of campus dining.
