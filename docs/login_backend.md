 ---                                                                                                                                                                                                                                                       
  API Login (JWT)                                                                                                                                                                                                                                           
  - Email: admin@gl-rater.com                                                                                                                                                                                                                               
  - Password: changeme123!                                                                                                                                                                                                                                  
  - Endpoint: POST http://localhost:8000/auth/jwt/login                                                                                                                                                                                                     
  - Use the returned access_token as Authorization: Bearer <token>

  Admin Panel (browser)
  - URL: http://localhost:8000/admin
  - Username: any non-empty value (MVP auth accepts any credentials)
  - Password: any non-empty value

  Swagger Docs (try auth endpoints interactively)
  - http://localhost:8000/docs

  ---
  You can also register a new user:
  curl -X POST http://localhost:8000/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"you@example.com","password":"YourPass123!","full_name":"Your Name","role":"underwriter"}'