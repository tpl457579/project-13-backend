# Backend Specifics

- Deployment Url - https://project-13-backend.onrender.com/

### Technologies Used

- **Node.js** – Used to run JavaScript on the server, enabling fast, scalable backend applications.
- **Express** – A lightweight web framework for building APIs and handling routing with ease.
- **Mongoose (MongoDB)** – Provides a structured, schema-based way to interact with MongoDB databases in Node.js.
- **Cron** – Allows scheduled tasks to run automatically at specified times or intervals.
- **Puppeteer** – Automates and controls a headless Chrome/Chromium browser for scraping or UI automation.
- **Cheerio** – Enables fast server-side HTML parsing and traversal, similar to jQuery, for scraping tasks.
- **Axios** – A promise-based HTTP client for making API requests from both Node.js and the browser.
- **Multer** – Handles file uploads in Express applications by processing multipart/form-data.
- **Cloudinary** – Stores, optimizes, and manages uploaded images and videos via a cloud media service.
- **bcrypt** – Securely hashes passwords to protect user credentials.
- **dotenv** – Loads environment variables from a `.env` file to keep configuration secure and separate from code.

**Authentication**

- JWT (JSON Web Tokens)
- bcrypt (password hashing)

**Image Upload**

- Cloudinary
- Multer
- multer-storage-cloudinary

**Scraping**

- Puppeteer
- Axios
- Cheerio

### Daily Scheduled Task

- **Time**: Every day at **2:00 AM & 4:00 AM**
- **Tool**: `node-cron`
- **File**: `cron.js`

#### What It Does:

1. **Scrapes products** from Amazon.ie using Cheerio + Axios
2. **Uploads images** to Cloudinary
3. **Upserts products** into MongoDB
4. **Cleans favourites** by removing references to deleted products

#### Logs:

- Success messages for scrape and cleanup
- Error messages with stack trace
