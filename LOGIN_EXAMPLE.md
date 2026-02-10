# Login Example

Quick login example using curl (replace URL if you set a different `REACT_APP_API_BASE_URL`):

```bash
curl -X 'POST' \
  'http://10.86.174.126:8001/api/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user@example.com",
  "password": "string"
}'
```

Successful response example:

```json
{
  "message": "Login successful",
  "user": {
    "id": 26,
    "email": "user@example.com",
    "name": "string",
    "role": "user",
    "status": "pending"
  }
}
```
