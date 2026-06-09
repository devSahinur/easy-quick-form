# Easy Quick Form
A Full Stack MERN app for building dynamic forms with drag and drop interface &amp; to track and view the responses received in the created form.

https://eqf.sobhoy.com

(Profile picture upload only works in local development as costs money in deployed server.)



## Installation

This is a [pnpm workspace](https://pnpm.io/workspaces) monorepo, so you need **pnpm**.
If you have Node 16.13+ you can enable it via Corepack (no global install needed):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Or install it globally:

```bash
npm install -g pnpm
```

Clone the project and navigate into it:

```bash
git clone https://github.com/devSahinur/easy-quick-form.git
cd easy-quick-form
```

Install the packages:

```bash
pnpm i
```

Build the shared validation package (required before the first run, since both the
client and server depend on it):

```bash
pnpm -F @form-builder/validation build
```

Create a `.env` file for **both** `client` and `server` using their `.env.example`
files. You can use [Brevo](https://www.brevo.com/) for a free SMTP server and
[MongoDB Atlas](https://www.mongodb.com/atlas/database) for the database.

Run the project (starts client + server together):

```bash
pnpm dev
```

By default the client runs on `http://localhost:4400` and the server on
`http://localhost:8000`.

## Deployment

The app deploys to **Vercel as two projects from this one repo** — the Express API as
a Serverless Function (root: `server`) and the Vite client as a static SPA
(root: `client`). The required `vercel.json` files and the serverless entry point
(`server/api/index.ts`) are already in the repo.

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full step-by-step guide (project
setup, environment variables, and CORS wiring), and **[CICD.md](./CICD.md)** for the
CI/CD workflow (automatic preview/production deploys, monorepo build optimization, and
the GitHub Actions quality gate).

> Note: profile-picture upload only works in local development — Vercel's serverless
> filesystem is read-only/ephemeral, so disk-based image storage is disabled in
> production (see the limitation note in DEPLOYMENT.md).

<h2> Built with </h2>
<ul>
  <li>Frontend: <b> React, TypeScript, Tailwind, React Hook Form, Zod, ShadcnUI, React Router, DND Kit, Tanstack Query, Tanstack Table, Tiptap, React Dropzone, React Easy Crop, Zustand </b></li>
  <li>Backend:  <b> Node, Express, TypeScript, Nodemailer, Multer, JWT </b> </li>
  <li>Database: <b> MongoDB, Mongoose </b> </li>
</ul>

<h2> Features </h2>
<ul>
  <li> JWT Authentication along with Protected Routes, Refresh Tokens, reuse detection and rotation. </li>
  <li> Logout, Change password and delete account functionalities. </li>
  <li> Email sending functionality after signup and while resetting password using Nodemailer. </li>
  <li> Profile picture upload with drag n drop and crop functionality. </li>
  <li> Implemented error logging mechanisms for easier troubleshooting and maintenance. </li>
  <li> Implemented proper error handling and user feedback mechanisms. </li>
  <li> Dynamic forms can be created using different form elements by dragging and dropping. </li>
  <li> CRUD operations and search functionality on the form. </li>
  <li> Functionality to submit the form and view the responses on the form. </li>
  <li> Included various form elements like WYSIWYG editor, Calendar, Date Range Picker etc. </li>
</ul>

<h2> API </h2>

<h4> Auth </h4>
<ul>
  <li> <b>POST</b> /api/v1/auth/signup </li>
  <li> <b>POST</b> /api/v1/auth/login </li>
  <li> <b>GET</b> /api/v1/auth/refresh </li>
  <li> <b>GET</b> /api/v1/auth/logout </li>
  <li> <b>POST</b> /api/v1/auth/forgot-password </li>
  <li> <b>PATCH</b> /api/v1/auth/reset-password/:token </li>
</ul>

<h4> User </h4>
<ul>
  <li> <b>PATCH</b> /api/v1/user/change-password </li>
  <li> <b>PATCH</b> /api/v1/user/profile </li>
  <li> <b>GET</b> /api/v1/user/profile </li>
  <li> <b>DELETE</b> /api/v1/user/delete-account </li>
</ul>

<h4> Form </h4>
<ul>
  <li> <b>GET</b> /api/v1/forms?page=0&pageSize=10&sort=-name&search=form </li>
  <li> <b>GET</b> /api/v1/forms/:id </li>
  <li> <b>POST</b> /api/v1/forms </li>
  <li> <b>PATCH</b> /api/v1/forms/:id </li>
  <li> <b>PATCH</b> /api/v1/forms/bulk-delete </li>
  <li> <b>DELETE</b> /api/v1/forms/:id </li>
</ul>

<h4> Form Response </h4>
<ul>
  <li> <b>GET</b> /api/v1/forms/:id/responses </li>
  <li> <b>POST</b> /api/v1/forms/:id/responses </li>
</ul>
