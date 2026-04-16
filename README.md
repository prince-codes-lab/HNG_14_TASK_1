# Name Profile API

A REST API that accepts a name, enriches it with data from three external APIs (gender, age, nationality), classifies the result, stores it in a database, and exposes endpoints to create, retrieve, filter, and delete profiles.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Classification Logic](#classification-logic)
- [Error Handling](#error-handling)
- [Deployment](#deployment)

---

## Overview

When a name is submitted to this API, it:

1. Calls [Genderize](https://genderize.io), [Agify](https://agify.io), and [Nationalize](https://nationalize.io) simultaneously
2. Classifies the age into a group and picks the top nationality by probability
3. Stores the enriched profile in MongoDB with a UUID v7 identifier
4. Returns the profile — or the existing one if the name was already submitted before

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Node.js + Express | Web server and routing |
| MongoDB + Mongoose | Database and data modeling |
| uuidv7 | UUID v7 ID generation |
| dotenv | Environment variable management |

---

## Project Structure

```
name-profile-api/
├── src/
│   ├── index.js              ← App entry point, middleware, server startup
│   ├── db.js                 ← MongoDB connection
│   ├── models/
│   │   └── Profile.js        ← Mongoose schema
│   ├── routes/
│   │   └── profiles.js       ← All 4 API endpoints
│   └── utils/
│       ├── classify.js       ← Age group + top country logic
│       └── fetchAPIs.js      ← Parallel external API calls + validation
├── .env                      ← Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A MongoDB Atlas account (free tier works fine)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/name-profile-api.git
cd name-profile-api

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Then fill in your MONGODB_URI (see Environment Variables section)

# 4. Start the development server
npm run dev
```

The server will start on `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the root of the project with the following:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nameprofiles
```

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (defaults to 3000) |
| `MONGODB_URI` | Your MongoDB Atlas connection string |

---

## API Reference

### Base URL

```
https://your-deployed-app.up.railway.app
```

---

### POST `/api/profiles`

Creates a new profile by calling the three external APIs and storing the result.

If a profile with the same name already exists, it returns the existing one without creating a duplicate.

**Request Body**

```json
{ "name": "ella" }
```

**Response — 201 Created**

```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DK",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00.000Z"
  }
}
```

**Response — 200 OK (duplicate)**

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { "...existing profile..." }
}
```

---

### GET `/api/profiles`

Returns all stored profiles. Supports optional query filters.

**Query Parameters (all optional, all case-insensitive)**

| Parameter | Example |
|---|---|
| `gender` | `?gender=male` |
| `country_id` | `?country_id=NG` |
| `age_group` | `?age_group=adult` |

Parameters can be combined: `/api/profiles?gender=male&country_id=NG`

**Response — 200 OK**

```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "id-1",
      "name": "emmanuel",
      "gender": "male",
      "age": 25,
      "age_group": "adult",
      "country_id": "NG"
    },
    {
      "id": "id-2",
      "name": "sarah",
      "gender": "female",
      "age": 28,
      "age_group": "adult",
      "country_id": "US"
    }
  ]
}
```

---

### GET `/api/profiles/:id`

Returns a single profile by its UUID.

**Response — 200 OK**

```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "emmanuel",
    "gender": "male",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 25,
    "age_group": "adult",
    "country_id": "NG",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00.000Z"
  }
}
```

**Response — 404 Not Found**

```json
{ "status": "error", "message": "Profile not found" }
```

---

### DELETE `/api/profiles/:id`

Deletes a profile by its UUID.

**Response — 204 No Content**

No response body.

**Response — 404 Not Found**

```json
{ "status": "error", "message": "Profile not found" }
```

---

## Classification Logic

### Age Group

Derived from the age value returned by the Agify API:

| Age Range | Group |
|---|---|
| 0 – 12 | `child` |
| 13 – 19 | `teenager` |
| 20 – 59 | `adult` |
| 60+ | `senior` |

### Nationality

The Nationalize API returns a list of countries each with a probability score. This API picks the country with the **highest probability** and stores its `country_id` and `country_probability`.

---

## Error Handling

All errors follow this consistent structure:

```json
{ "status": "error", "message": "<description>" }
```

### Client Errors

| Status | Cause |
|---|---|
| `400 Bad Request` | Name field is missing or empty |
| `422 Unprocessable Entity` | Name is not a string |
| `404 Not Found` | Profile ID does not exist |

### External API Errors

If any of the three external APIs return invalid or empty data, the API returns a `502` and does **not** store anything.

| Condition | Trigger |
|---|---|
| Genderize returns `gender: null` or `count: 0` | `502` |
| Agify returns `age: null` | `502` |
| Nationalize returns no country data | `502` |

**502 Response Format**

```json
{ "status": "error", "message": "Genderize returned an invalid response" }
```

---

## Deployment

This API is deployed on [Railway](https://railway.app).

**Live Base URL:**
```
https://your-deployed-app.up.railway.app
```

### Deploying Your Own Instance

1. Push your code to GitHub
2. Create a new project on Railway and connect your repo
3. Add the `MONGODB_URI` environment variable in Railway's dashboard
4. Railway will auto-detect Node.js and deploy automatically

> **Note:** CORS is configured to allow all origins (`Access-Control-Allow-Origin: *`) so the API is accessible from any client or grading script.