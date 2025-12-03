# Trybe API Documentation

**Version:** 1.0
**Base URL:** `https://your-domain.com`
**Authentication:** Cookie-based sessions

---

## Table of Contents

1. [Authentication](#authentication)
2. [Challenges](#challenges)
3. [Posts](#posts)
4. [Checkins](#checkins)
5. [Comments](#comments)
6. [Likes](#likes)
7. [Users](#users)
8. [Categories](#categories)
9. [Member Challenges](#member-challenges)
10. [Common Data Models](#common-data-models)
11. [Error Handling](#error-handling)

---

## Authentication

All authenticated endpoints require a valid session cookie. The session cookie is set automatically upon successful login/registration.

### POST /mobile/login

Authenticate a user and create a session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
- Sets `trybe-session` cookie (httpOnly, 30-day expiry)
- Redirects to `/challenges`

**Response (401 Unauthorized):**
```json
{
  "errors": {
    "email": "Invalid email or password"
  }
}
```

---

### POST /mobile/signup

Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "securepassword",
  "passwordMatch": "securepassword"
}
```

**Validation Rules:**
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
- `passwordMatch`: Must match password

**Response (200 OK):**
- Sets `trybe-session` cookie
- Redirects to `/challenges`

**Response (400 Bad Request):**
```json
{
  "errors": {
    "email": "Email already in use",
    "password": "Password must be at least 8 characters"
  }
}
```

---

### POST /mobile/oauth/password/:hash/:userId

Set password for OAuth users who authenticated via third-party providers.

**URL Parameters:**
- `hash`: Secure token for password reset
- `userId`: User ID

**Request Body:**
```json
{
  "password": "newsecurepassword",
  "passwordMatch": "newsecurepassword"
}
```

**Response (200 OK):**
- Password set successfully
- Redirects to `/mobile/login` with success message

**Response (400 Bad Request):**
```json
{
  "errors": {
    "token": "Invalid or expired token"
  }
}
```

---

## Challenges

### GET /api/challenges

Fetch a list of challenges with filtering options.

**Query Parameters:**
- `userId`: Filter challenges created by specific user
- `memberId`: Filter challenges a user is member of

**Response (200 OK):**
```json
{
  "challenges": [
    {
      "id": 1,
      "name": "30-Day Fitness Challenge",
      "description": "Get fit in 30 days",
      "mission": "Build healthy habits",
      "type": "SCHEDULED",
      "status": "PUBLISHED",
      "frequency": "DAILY",
      "startAt": "2025-01-01T00:00:00Z",
      "endAt": "2025-01-30T23:59:59Z",
      "numDays": 30,
      "coverPhotoMeta": {
        "secure_url": "https://...",
        "public_id": "...",
        "width": 1200,
        "height": 630
      },
      "videoMeta": null,
      "icon": "💪",
      "color": "#FF6B6B",
      "public": true,
      "userId": 42,
      "categories": [
        {
          "id": 1,
          "name": "Fitness"
        }
      ],
      "_count": {
        "memberChallenges": 156
      }
    }
  ]
}
```

---

### GET /api/challenges/:range

Fetch challenges by status range.

**URL Parameters:**
- `range`: One of:
  - `active`: Currently running challenges
  - `upcoming`: Not yet started
  - `archived`: Completed challenges

**Response (200 OK):**
```json
{
  "challenges": [ /* array of challenge objects */ ]
}
```

---

### GET /api/challenges/v/:id

Get detailed information about a specific challenge.

**URL Parameters:**
- `id`: Challenge ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "30-Day Fitness Challenge",
  "description": "Get fit in 30 days",
  "mission": "Build healthy habits",
  "type": "SCHEDULED",
  "status": "PUBLISHED",
  "frequency": "DAILY",
  "startAt": "2025-01-01T00:00:00Z",
  "endAt": "2025-01-30T23:59:59Z",
  "numDays": 30,
  "coverPhotoMeta": { /* CloudinaryMeta object */ },
  "videoMeta": null,
  "icon": "💪",
  "color": "#FF6B6B",
  "public": true,
  "userId": 42,
  "categories": [ /* array of categories */ ],
  "user": {
    "id": 42,
    "profile": {
      "firstName": "Jane",
      "lastName": "Doe",
      "avatarMeta": { /* CloudinaryMeta object */ }
    }
  },
  "_count": {
    "memberChallenges": 156
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Challenge not found"
}
```

---

### GET /api/challenges/v/:id/:userId

Get challenge details for a specific user (includes membership info).

**URL Parameters:**
- `id`: Challenge ID
- `userId`: User ID

**Authentication:** Required

**Response (200 OK):**
```json
{
  "challenge": { /* challenge object */ },
  "memberChallenge": {
    "id": 123,
    "userId": 42,
    "challengeId": 1,
    "dayNumber": 5,
    "startAt": "2025-01-01T00:00:00Z",
    /* additional membership fields */
  }
}
```

---

### GET /api/challenges/v/:id/membership

Get membership information for current user in a challenge.

**URL Parameters:**
- `id`: Challenge ID

**Authentication:** Required

**Response (200 OK):**
```json
{
  "memberChallenge": {
    "id": 123,
    "userId": 42,
    "challengeId": 1,
    "cohortId": 5,
    "startAt": "2025-01-01T00:00:00Z",
    "dayNumber": 5,
    "notificationHour": 9,
    "notificationMinute": 0,
    "lastCheckIn": "2025-01-05T10:30:00Z",
    "nextCheckIn": "2025-01-06T09:00:00Z"
  }
}
```

---

### POST /api/challenges

Create or update a challenge.

**Authentication:** Required

**Request:** Multipart form data (FormData)

**Form Fields:**
- `name` (required): Challenge name
- `description` (required): Challenge description
- `mission`: Mission statement
- `type` (required): `SCHEDULED` or `SELF_LED`
- `status` (required): `PUBLISHED`, `DRAFT`, or `ARCHIVED`
- `frequency` (required): `DAILY`, `WEEKDAYS`, `ALTERNATING`, `WEEKLY`, `CUSTOM`
- `startAt`: Start date (required for SCHEDULED)
- `endAt`: End date (required for SCHEDULED)
- `numDays`: Number of days (required for SELF_LED, 5-60)
- `icon`: Emoji icon
- `color`: Hex color code
- `public`: Boolean, default true
- `categoryIds`: JSON array of category IDs
- `coverPhoto`: Image file (optional)
- `video`: Video file (optional)
- `id`: Challenge ID (for updates)

**Response (200 OK):**
```json
{
  "challenge": {
    "id": 1,
    "name": "30-Day Fitness Challenge",
    /* full challenge object */
  }
}
```

**Response (400 Bad Request):**
```json
{
  "errors": {
    "name": "Name is required",
    "startAt": "Start date is required for scheduled challenges"
  }
}
```

---

### POST /api/challenges/join-unjoin/:id

Join or leave a challenge.

**Authentication:** Required

**URL Parameters:**
- `id`: Challenge ID

**Request Body (for SELF_LED challenges):**
```json
{
  "action": "join",
  "startAt": "2025-01-01T00:00:00Z",
  "notificationHour": 9,
  "notificationMinute": 0,
  "cohortId": 5
}
```

**Request Body (for SCHEDULED challenges):**
```json
{
  "action": "join"
}
```

**Request Body (to leave):**
```json
{
  "action": "unjoin"
}
```

**Response (200 OK) - Join:**
```json
{
  "memberChallenge": {
    "id": 123,
    "userId": 42,
    "challengeId": 1,
    "cohortId": 5,
    "startAt": "2025-01-01T00:00:00Z",
    "dayNumber": 1,
    "notificationHour": 9,
    "notificationMinute": 0,
    "lastCheckIn": null,
    "nextCheckIn": "2025-01-01T09:00:00Z"
  }
}
```

**Response (200 OK) - Leave:**
```json
{
  "message": "Successfully left challenge"
}
```

---

### POST /api/challenges/delete/:id

Delete a challenge (creator only).

**Authentication:** Required (must be challenge creator or admin)

**URL Parameters:**
- `id`: Challenge ID

**Response (200 OK):**
```json
{
  "message": "Challenge deleted successfully"
}
```

**Response (403 Forbidden):**
```json
{
  "error": "Not authorized to delete this challenge"
}
```

---

### GET /api/challenges/v/:id/program

Get the program/content schedule for a challenge.

**Authentication:** Required (must be challenge member)

**URL Parameters:**
- `id`: Challenge ID

**Query Parameters:**
- `cohortId`: Cohort ID (for SELF_LED challenges)

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": 1,
      "title": "Day 1: Getting Started",
      "body": "Welcome to the challenge! Today we'll...",
      "publishAt": "2025-01-01T00:00:00Z",
      "publishOnDayNumber": null,
      "imageMeta": { /* CloudinaryMeta */ },
      "videoMeta": null,
      "embed": null,
      "userId": 42,
      "user": {
        "profile": {
          "firstName": "Jane",
          "lastName": "Doe"
        }
      },
      "_count": {
        "likes": 24,
        "comments": 8
      }
    }
  ]
}
```

---

## Posts

### GET /api/posts

Fetch a list of posts.

**Query Parameters:**
- `challengeId`: Filter by challenge
- `userId`: Filter by user
- `public`: Filter public posts only

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": 1,
      "title": "My Fitness Journey",
      "body": "Today I completed my first workout...",
      "imageMeta": { /* CloudinaryMeta */ },
      "videoMeta": null,
      "embed": null,
      "public": true,
      "challengeId": 1,
      "published": true,
      "publishAt": "2025-01-01T10:00:00Z",
      "userId": 42,
      "_count": {
        "likes": 15,
        "comments": 3
      }
    }
  ]
}
```

---

### GET /api/posts/v/:id

View a single post.

**URL Parameters:**
- `id`: Post ID

**Response (200 OK):**
```json
{
  "post": {
    "id": 1,
    "title": "My Fitness Journey",
    "body": "Today I completed my first workout...",
    "imageMeta": {
      "secure_url": "https://...",
      "width": 800,
      "height": 600
    },
    "videoMeta": null,
    "embed": null,
    "public": true,
    "challengeId": 1,
    "published": true,
    "publishAt": "2025-01-01T10:00:00Z",
    "publishOnDayNumber": null,
    "createdAt": "2025-01-01T09:55:00Z",
    "updatedAt": "2025-01-01T09:55:00Z",
    "userId": 42,
    "user": {
      "id": 42,
      "profile": {
        "firstName": "Jane",
        "lastName": "Doe",
        "avatarMeta": { /* CloudinaryMeta */ }
      }
    },
    "_count": {
      "likes": 15,
      "comments": 3
    }
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Post not found"
}
```

---

### POST /api/posts

Create or update a post.

**Authentication:** Required

**Request:** Multipart form data (FormData)

**Form Fields:**
- `title` (required): Post title
- `body` (required): Post content (min 10 characters)
- `challengeId`: Associated challenge ID (optional)
- `published`: Boolean, publish immediately
- `publishAt`: Publish date (for SCHEDULED challenges)
- `publishOnDayNumber`: Day number 1-N (for SELF_LED challenges)
- `notifyMembers`: Boolean, send email to challenge members
- `public`: Boolean, visible to non-members
- `image`: Image file (optional)
- `video`: Video file (optional)
- `embed`: YouTube or embed URL (optional)
- `id`: Post ID (for updates)

**Response (200 OK):**
```json
{
  "post": {
    "id": 1,
    "title": "My Fitness Journey",
    /* full post object */
  }
}
```

**Response (400 Bad Request):**
```json
{
  "errors": {
    "title": "Title is required",
    "body": "Body must be at least 10 characters"
  }
}
```

---

### POST /api/posts/delete/:id

Delete a post (creator only).

**Authentication:** Required (must be post creator or admin)

**URL Parameters:**
- `id`: Post ID

**Response (200 OK):**
```json
{
  "message": "Post deleted successfully"
}
```

---

## Checkins

### GET /api/checkins/:challengeId/:userId/:cohortId?

Fetch checkins for a challenge.

**URL Parameters:**
- `challengeId`: Challenge ID (required)
- `userId`: User ID (required)
- `cohortId`: Cohort ID (optional, for SELF_LED challenges)

**Response (200 OK):**
```json
{
  "checkIns": [
    {
      "id": 1,
      "body": "Completed my morning workout!",
      "imageMeta": {
        "secure_url": "https://...",
        "width": 800,
        "height": 600
      },
      "videoMeta": null,
      "userId": 42,
      "challengeId": 1,
      "cohortId": null,
      "memberChallengeId": 123,
      "likeCount": 5,
      "commentCount": 2,
      "createdAt": "2025-01-01T10:30:00Z",
      "updatedAt": "2025-01-01T10:30:00Z",
      "user": {
        "id": 42,
        "profile": {
          "firstName": "Jane",
          "lastName": "Doe",
          "avatarMeta": { /* CloudinaryMeta */ }
        }
      }
    }
  ]
}
```

---

### POST /api/challenges/:id/checkins/:cohortId?

Create or update a checkin.

**Authentication:** Required

**URL Parameters:**
- `id`: Challenge ID
- `cohortId`: Cohort ID (optional, for SELF_LED challenges)

**Request:** Multipart form data (FormData)

**Form Fields:**
- `body`: Text note (optional)
- `userId` (required): User ID
- `challengeId` (required): Challenge ID
- `cohortId`: Cohort ID (for SELF_LED)
- `checkinId`: Checkin ID (for updates)
- `image`: Image file or "delete" to remove
- `video`: Video file or "delete" to remove

**Response (200 OK):**
```json
{
  "checkIn": {
    "id": 1,
    "body": "Completed my morning workout!",
    "imageMeta": { /* CloudinaryMeta */ },
    "videoMeta": null,
    "userId": 42,
    "challengeId": 1,
    "cohortId": null,
    "memberChallengeId": 123,
    "likeCount": 0,
    "commentCount": 0,
    "createdAt": "2025-01-01T10:30:00Z",
    "updatedAt": "2025-01-01T10:30:00Z",
    "user": { /* user object */ }
  },
  "memberChallenge": {
    "id": 123,
    "lastCheckIn": "2025-01-01T10:30:00Z",
    "nextCheckIn": "2025-01-02T09:00:00Z",
    "dayNumber": 1
  }
}
```

**Response (400 Bad Request):**
```json
{
  "errors": {
    "membership": "You must be a member of this challenge to check in"
  }
}
```

---

### POST /api/checkins/delete/:id

Delete a checkin (creator only).

**Authentication:** Required (must be checkin creator or admin)

**URL Parameters:**
- `id`: Checkin ID

**Response (200 OK):**
```json
{
  "message": "Checkin deleted successfully"
}
```

---

## Comments

### POST /api/comments

Create or update a comment.

**Authentication:** Required

**Request:** Multipart form data (FormData)

**Form Fields:**
- `body` (required): Comment text
- `postId`: Post ID (for post comments)
- `challengeId`: Challenge ID (for challenge comments)
- `checkInId`: Checkin ID (for checkin comments)
- `threadId`: Thread ID (for challenge chat)
- `replyToId`: Parent comment ID (for nested replies)
- `cohortId`: Cohort ID (for SELF_LED challenges)
- `image`: Image file (optional)
- `video`: Video file (optional)
- `commentId`: Comment ID (for updates)

**Note:** One of `postId`, `challengeId`, `checkInId`, or `threadId` is required.

**Response (200 OK):**
```json
{
  "comment": {
    "id": 1,
    "body": "Great progress!",
    "imageMeta": null,
    "videoMeta": null,
    "userId": 42,
    "postId": 1,
    "challengeId": null,
    "checkInId": null,
    "threadId": null,
    "cohortId": null,
    "replyToId": null,
    "threadDepth": 0,
    "likeCount": 0,
    "replyCount": 0,
    "createdAt": "2025-01-01T11:00:00Z",
    "user": {
      "id": 42,
      "profile": {
        "firstName": "Jane",
        "lastName": "Doe",
        "avatarMeta": { /* CloudinaryMeta */ }
      }
    }
  }
}
```

**Response (400 Bad Request):**
```json
{
  "errors": {
    "body": "Comment body is required",
    "threadDepth": "Maximum nesting level (5) reached"
  }
}
```

---

### GET /api/comments/:id/replies

Get replies to a specific comment.

**URL Parameters:**
- `id`: Comment ID

**Response (200 OK):**
```json
{
  "replies": [
    {
      "id": 2,
      "body": "Thanks!",
      "replyToId": 1,
      "threadDepth": 1,
      "userId": 43,
      "user": {
        "profile": {
          "firstName": "John",
          "lastName": "Smith"
        }
      },
      "createdAt": "2025-01-01T11:15:00Z"
    }
  ]
}
```

---

### GET /api/comments/:type/:id

Get all comments for a specific item.

**URL Parameters:**
- `type`: Type of item (`post`, `challenge`, `checkin`, `thread`)
- `id`: Item ID

**Response (200 OK):**
```json
{
  "comments": [
    {
      "id": 1,
      "body": "Great post!",
      "threadDepth": 0,
      "userId": 42,
      "postId": 1,
      "likeCount": 3,
      "replyCount": 1,
      "createdAt": "2025-01-01T11:00:00Z",
      "user": { /* user object */ },
      "replies": [ /* nested replies */ ]
    }
  ]
}
```

---

### DELETE Comment

To delete a comment, use POST /api/comments with:

**Form Fields:**
- `intent`: "delete"
- `commentId`: Comment ID to delete

**Response (200 OK):**
```json
{
  "message": "Comment deleted successfully"
}
```

---

## Likes

### POST /api/likes

Add or remove a like.

**Authentication:** Required

**Request Body:**
```json
{
  "type": "post",
  "id": 1,
  "action": "like"
}
```

**Parameters:**
- `type`: Type of item (`post`, `challenge`, `checkin`, `comment`)
- `id`: Item ID
- `action`: `like` or `unlike`

**Response (200 OK):**
```json
{
  "liked": true,
  "likeCount": 16
}
```

---

### GET /api/likes/:type/:id

Get like status and count for an item.

**URL Parameters:**
- `type`: Type of item (`post`, `challenge`, `checkin`, `comment`)
- `id`: Item ID

**Authentication:** Optional (returns liked status if authenticated)

**Response (200 OK):**
```json
{
  "likeCount": 16,
  "liked": true,
  "likes": [
    {
      "id": 1,
      "userId": 42,
      "user": {
        "profile": {
          "firstName": "Jane",
          "lastName": "Doe"
        }
      }
    }
  ]
}
```

---

### GET /api/likes/:type/:id/comments

Get likes for all comments on an item.

**URL Parameters:**
- `type`: Type of item (`post`, `challenge`, `checkin`)
- `id`: Item ID

**Response (200 OK):**
```json
{
  "commentLikes": [
    {
      "commentId": 1,
      "likeCount": 5,
      "liked": false
    }
  ]
}
```

---

## Users

### GET /api/users/:id

Get user profile information.

**URL Parameters:**
- `id`: User ID

**Response (200 OK):**
```json
{
  "user": {
    "id": 42,
    "email": "user@example.com",
    "role": "USER",
    "profile": {
      "firstName": "Jane",
      "lastName": "Doe",
      "bio": "Fitness enthusiast",
      "avatarMeta": { /* CloudinaryMeta */ }
    },
    "_count": {
      "posts": 24,
      "challenges": 3,
      "memberChallenges": 8
    }
  }
}
```

---

### GET /api/users/:id/likes

Get items liked by a user.

**URL Parameters:**
- `id`: User ID

**Query Parameters:**
- `type`: Filter by type (`post`, `challenge`, `checkin`, `comment`)

**Response (200 OK):**
```json
{
  "likes": [
    {
      "id": 1,
      "type": "post",
      "post": {
        "id": 1,
        "title": "My Journey",
        /* post object */
      },
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ]
}
```

---

## Categories

### GET /api/categories

Get all available categories.

**Response (200 OK):**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Fitness",
      "slug": "fitness",
      "description": "Physical health and exercise",
      "_count": {
        "challenges": 45
      }
    },
    {
      "id": 2,
      "name": "Mindfulness",
      "slug": "mindfulness",
      "description": "Mental health and meditation",
      "_count": {
        "challenges": 28
      }
    }
  ]
}
```

---

## Member Challenges

### GET /api/memberchallenges/:id

Get a specific member challenge record.

**URL Parameters:**
- `id`: MemberChallenge ID

**Authentication:** Required

**Response (200 OK):**
```json
{
  "memberChallenge": {
    "id": 123,
    "userId": 42,
    "challengeId": 1,
    "cohortId": 5,
    "startAt": "2025-01-01T00:00:00Z",
    "dayNumber": 5,
    "notificationHour": 9,
    "notificationMinute": 0,
    "lastCheckIn": "2025-01-05T10:30:00Z",
    "nextCheckIn": "2025-01-06T09:00:00Z",
    "_count": {
      "checkIns": 5
    },
    "challenge": {
      "id": 1,
      "name": "30-Day Fitness Challenge",
      /* challenge object */
    }
  }
}
```

---

### GET /api/memberchallenges/:challengeId/:userId

Get a user's membership in a specific challenge.

**URL Parameters:**
- `challengeId`: Challenge ID
- `userId`: User ID

**Authentication:** Required

**Response (200 OK):**
```json
{
  "memberChallenge": {
    "id": 123,
    "userId": 42,
    "challengeId": 1,
    "dayNumber": 5,
    /* full membership object */
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Membership not found"
}
```

---

### POST /api/memberchallenges/:id

Update a member challenge record.

**URL Parameters:**
- `id`: MemberChallenge ID

**Authentication:** Required

**Request Body:**
```json
{
  "notificationHour": 10,
  "notificationMinute": 30
}
```

**Response (200 OK):**
```json
{
  "memberChallenge": {
    "id": 123,
    "notificationHour": 10,
    "notificationMinute": 30,
    /* updated membership object */
  }
}
```

---

## Common Data Models

### Challenge Types

- **SCHEDULED**: Fixed start and end dates, all members follow same timeline
- **SELF_LED**: Flexible start dates, day-number-based content, members can start anytime

### Challenge Status

- **PUBLISHED**: Live and discoverable
- **DRAFT**: Not visible to non-creators
- **ARCHIVED**: Completed, read-only

### Challenge Frequency

- **DAILY**: Every day
- **WEEKDAYS**: Monday through Friday
- **ALTERNATING**: Every other day
- **WEEKLY**: Once per week
- **CUSTOM**: Custom schedule

### CloudinaryMeta

Media objects (images/videos) are stored as:

```typescript
{
  "public_id": "string",
  "version": number,
  "signature": "string",
  "width": number,
  "height": number,
  "format": "string",
  "resource_type": "image" | "video",
  "created_at": "string",
  "bytes": number,
  "type": "string",
  "url": "string",
  "secure_url": "string"
}
```

### CurrentUser

The authenticated user object:

```typescript
{
  "id": number,
  "email": "string",
  "role": "ADMIN" | "USER",
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "avatarMeta": CloudinaryMeta | null,
    "bio": "string"
  },
  "locale": "string",
  "dateFormat": "string",
  "timeFormat": "string",
  "memberChallenges": MemberChallenge[]
}
```

### MemberChallenge

User's membership in a challenge:

```typescript
{
  "id": number,
  "userId": number,
  "challengeId": number,
  "cohortId": number | null,
  "startAt": "2025-01-01T00:00:00Z",
  "dayNumber": number,
  "notificationHour": number,
  "notificationMinute": number,
  "lastCheckIn": "2025-01-01T10:30:00Z" | null,
  "nextCheckIn": "2025-01-02T09:00:00Z",
  "_count": {
    "checkIns": number
  }
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "errors": {
    "field": "Error message"
  }
}
```

Or:

```json
{
  "error": "General error message"
}
```

### HTTP Status Codes

- **200 OK**: Success
- **400 Bad Request**: Validation error or malformed request
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

---

## Real-time Updates (Pusher)

The API uses Pusher for real-time updates in challenge chat.

**Channel naming:** `challenge-{challengeId}-cohort-{cohortId}`
**Event:** `new-message`

Subscribe to channels to receive live updates for:
- New comments in challenge chat
- New checkins
- New posts

**Example payload:**
```json
{
  "type": "comment" | "checkin" | "post",
  "data": { /* comment/checkin/post object */ }
}
```

---

## Session Management

### Cookie Details

- **Name:** `trybe-session`
- **Duration:** 30 days
- **Attributes:** httpOnly, sameSite: lax, secure (in production)

### Authentication

Include the session cookie in all authenticated requests. The cookie is automatically set by the browser after successful login/registration.

---

## Rate Limiting

*(To be implemented)*

Current API has no rate limiting. Production implementation should include appropriate rate limits.

---

## File Uploads

All file uploads use `multipart/form-data` encoding.

**Supported formats:**
- **Images:** JPG, PNG, GIF, WebP
- **Videos:** MP4, MOV, AVI

**Size limits:**
- Images: 10MB
- Videos: 100MB

**Storage:** Files are uploaded to Cloudinary and optimized automatically.

---

## Best Practices

1. **Always check challenge type** before rendering UI:
   - SCHEDULED: Use `publishAt`, `startAt`, `endAt` dates
   - SELF_LED: Use `publishOnDayNumber`, member's `dayNumber`

2. **Include cohortId** for SELF_LED challenges in all requests

3. **Handle session expiry** gracefully:
   - 401 responses indicate session expired
   - Redirect to login and preserve navigation state

4. **Optimize image loading**:
   - Use Cloudinary transformations in URLs
   - Example: `secure_url + "?w=400&h=300&c=fill"`

5. **Real-time updates**:
   - Subscribe to Pusher channels for live chat
   - Unsubscribe on component unmount

6. **Date handling**:
   - All dates in ISO 8601 format
   - Server returns UTC, client converts to local timezone

7. **Comment nesting**:
   - Maximum thread depth is 5 levels
   - Check `threadDepth` before allowing replies

8. **Media handling**:
   - Always include proper Content-Type for FormData
   - Handle upload progress for better UX
   - Validate file types and sizes client-side

---

## Support

For questions or issues with the API, contact the development team or refer to the main documentation.
