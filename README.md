### Getting started

- clone github repository - https://github.com/tpl457579/project-13-backend
- npm init -y (to install dependencies)
- node index.js (to start server)

# Backend Specifics

- Deployment Url - https://project-13-backend-1.onrender.com/

### Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dogs` | Retrieves all dog listings. | Public |
| `GET` | `/api/dogs/:id` | Retrieves a specific dog by ID. | Public |
| `POST` | `/api/dogs/save` | Creates or updates a dog entry. | Admin |
| `DELETE` | `/api/dogs/:id` | Removes a dog entry. | Admin |
| `GET` | `/api/facts` | Retrieves all dog facts. | Public |
| `GET` | `/api/cats` | Retrieves all cat listings. | Public |
| `GET` | `/api/cats/:id` | Retrieves a specific cat by ID. | Public |
| `POST` | `/api/cats/save` | Creates or updates a cat entry. | Admin |
| `DELETE` | `/api/cats/:id` | Removes a cat entry. | Admin |
| `GET` | `/api/facts` | Retrieves all cat facts. | Public |
| `POST` | `/api/products/fetch-metadata` | Scrapes details from external URLs. | Admin |
| `GET` | `/api/products` | Lists all inventory products. | Public |
| `GET` | `/api/products/:id` | Fetches details for a single product. | Public |
| `POST` | `/api/products/save` | Adds a new product to the database. | Auth + Admin |
| `PUT` | `/api/products/save/:id` | Updates an existing product. | Auth + Admin |
| `DELETE` | `/api/products/:id` | Deletes a product from the system. | Auth + Admin |
| `POST` | `/api/users/register` | User account creation. | Public |
| `POST` | `/api/users/login` | User authentication/token issuance. | Public |
| `GET` | `/api/users` | Retrieves a list of all users. | Auth |
| `GET` | `/api/users/:id` | Returns a specific user profile. | Auth |
| `GET` | `/api/users/:id/favourites` | Lists products saved to a user's favorites. | Auth |
| `PUT` | `/api/users/:id` | Updates profile information. | Auth |
| `PUT` | `/api/users/favourites/:productId` | Toggles a product in the favorites list. | Auth |
| `DELETE` | `/api/users/:id` | Permanently deletes a user account. | Auth |

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
