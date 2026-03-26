# Routes API Documentation

This document provides details on the API endpoints for managing routes.

## Base URL

All API endpoints are accessed through the Supabase client.

## Authentication

All endpoints require administrator privileges. The system uses Row Level Security (RLS) in Supabase, which checks if the authenticated user has the 'admin' role.

---

## 1. Get All Routes

- **Description**: Retrieves a list of all non-deleted routes.
- **Hook**: `useAdminRoutes()`
- **Method**: `GET`
- **Query**: 
  ```sql
  SELECT *, pickup_points(*) 
  FROM routes 
  WHERE is_deleted = false 
  ORDER BY created_at DESC;
  ```
- **Response (Success)**:
  - **Code**: 200 OK
  - **Content**: `Array<RouteWithPickups>`
    ```json
    [
      {
        "id": "RTE-1678886400000",
        "route_code": "JKT-BDG",
        "name": "Jakarta - Bandung Express",
        "origin": "Jakarta",
        "destination": "Bandung",
        "distance": 150,
        "estimated_time": "3 hours",
        "status": "active",
        "is_deleted": false,
        "created_at": "2023-03-15T12:00:00Z",
        "pickup_points": []
      }
    ]
    ```

---

## 2. Create New Route

- **Description**: Creates a new route.
- **Hook**: `useAdminRouteCreate()`
- **Method**: `POST`
- **Body**: `RouteInsert` (object)
  ```json
  {
    "id": "RTE-1678886400001",
    "route_code": "SBY-MLG",
    "name": "Surabaya - Malang Shuttle",
    "origin": "Surabaya",
    "destination": "Malang",
    "distance": 90,
    "estimated_time": "2 hours",
    "status": "active"
  }
  ```
- **Response (Success)**:
  - **Code**: 201 Created
  - **Content**: The newly created `Route` object.
- **Validation**:
  - `route_code`, `name`, `origin`, `destination` are required and have minimum length constraints.
  - `distance` must be a positive number.
  - `status` must be either 'active' or 'inactive'.

---

## 3. Update Existing Route

- **Description**: Updates the details of an existing route.
- **Hook**: `useAdminRouteUpdate()`
- **Method**: `PATCH`
- **Parameters**:
  - `id`: The ID of the route to update.
- **Body**: `RouteUpdate` (object with partial fields)
  ```json
  {
    "name": "Jakarta - Bandung Super Express",
    "status": "inactive"
  }
  ```
- **Response (Success)**:
  - **Code**: 200 OK
  - **Content**: The updated `Route` object.

---

## 4. Delete Route (Soft Delete)

- **Description**: Marks a route as deleted.
- **Hook**: `useAdminRouteDelete()`
- **Method**: `PATCH`
- **Parameters**:
  - `id`: The ID of the route to delete.
- **Action**: Sets `is_deleted` to `true` and `status` to `inactive`.
- **Response (Success)**:
  - **Code**: 204 No Content
