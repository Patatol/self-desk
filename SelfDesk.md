# ?? SelfDesk

**Your private, all-in-one personal workspace — chat, store, and write, all in one place.**

---

# ?? Overview

SelfDesk is a password-protected personal web app designed for developers and individuals who want a **secure, minimal, and self-hosted workspace**.

It combines:

* ?? Self-chat (like WhatsApp for yourself)
* ?? Markdown notes editor
* ?? File storage system

Accessible from any browser — fully under your control.

---

# ?? Tech Stack

* **Framework:** Next.js
* **Backend & Database:** Supabase
* **Deployment:** Vercel
* **Styling:** Tailwind CSS

---

# ?? Core Features

## ?? Authentication

* Single-user password protection
* No signup required
* Lightweight session handling

---

## ?? Self Chat System

* Clean WhatsApp-style interface
* Send:

  * Text messages
  * Emojis ??
  * Files (images, PDFs, etc.)
* Features:

  * Timestamped messages
  * Scrollable history
  * Message search

---

## ?? Notes & Editor

* Markdown-based editor
* Create / edit / delete notes
* Rich formatting support
* Optional live preview

---

## ?? File Storage

* Upload and manage files
* Organized storage (images, docs, etc.)
* Secure access via URLs

---

## ?? Global Search

* Search across messages and notes
* Fast and responsive filtering

---

# ?? System Architecture

```id="arch001"
Client (Browser)
   ?
Next.js App (Frontend + API Routes)
   ?
Supabase
   +-- PostgreSQL (Database)
   +-- Storage (Files)
```

---

# ??? Database Schema

## ?? messages

```id="db001"
id (uuid)
content (text)
type (text | file)
file_url (text, nullable)
created_at (timestamp)
```

---

## ?? notes

```id="db002"
id (uuid)
title (text)
content (markdown text)
created_at (timestamp)
updated_at (timestamp)
```

---

# ?? Storage Structure

```id="storage001"
bucket: files
   +-- images/
   +-- documents/
   +-- others/
```

---

# ?? Authentication Flow

```id="auth001"
Enter password
   ?
Validate credentials
   ?
Store session (token/localStorage)
   ?
Access granted
```

---

# ?? App Structure

```id="app001"
/app
  /login
  /chat
  /notes
  /api
    /auth
    /messages
    /notes
    /upload

/components
  ChatUI
  MessageBubble
  Editor
  FileUploader

/lib
  supabaseClient
  auth
```

---

# ?? API Endpoints

## Auth

* POST /api/auth/login

## Messages

* GET /api/messages
* POST /api/messages
* DELETE /api/messages/:id

## Notes

* GET /api/notes
* POST /api/notes
* PUT /api/notes/:id
* DELETE /api/notes/:id

## Upload

* POST /api/upload

---

# ?? Pages

* `/login` ? Password entry
* `/chat` ? Chat interface
* `/notes` ? Notes editor
* `/` ? Redirect based on auth

---

# ?? Key Flows

## Send Message

```id="flow001"
Type ? Send ? API ? DB ? UI update
```

## Upload File

```id="flow002"
Select ? Upload ? Get URL ? Save in DB
```

## Edit Note

```id="flow003"
Open ? Edit ? Save ? Update DB
```

---

# ?? Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables:

   * SUPABASE_URL
   * SUPABASE_ANON_KEY
4. Deploy ??

---

# ?? Future Enhancements

* End-to-end encryption ??
* Voice notes ???
* Drag & drop uploads
* Dark mode ??
* PWA support

---

# ?? Limitations

* Free tier storage limits (~1GB)
* Single-user only
* Basic authentication

---

# ? Vision

SelfDesk aims to be your **personal digital desk** —
a private space where you can:

* Think ??
* Chat ??
* Store ??
* Write ??

All in one place.

---
