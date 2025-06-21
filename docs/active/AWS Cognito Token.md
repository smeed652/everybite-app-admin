
### This is for checking if the RBAC is working correctly
curl -H "Authorization: Bearer eyJraWQiOiJ5SjFnUEVuck9Cd3cwdktGZytRMFRISmlaM2ZYK0xvYmMwQWFSY0g4bUFJPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIwOTQ5MTllZS1iMDgxLTcwODctM2QyMy1iY2EyODUwMDE1ZDciLCJjb2duaXRvOmdyb3VwcyI6WyJBRE1JTiJdLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMS5hbWF6b25hd3MuY29tXC91cy13ZXN0LTFfSHVWd3l3bUgxIiwiY29nbml0bzp1c2VybmFtZSI6IjA5NDkxOWVlLWIwODEtNzA4Ny0zZDIzLWJjYTI4NTAwMTVkNyIsIm9yaWdpbl9qdGkiOiJkYzYxNDNjZi1hNzUyLTRjNWUtOWU2Zi1mMDE3NWQ4ZDUyZGMiLCJhdWQiOiI3NDZkN2M2aXR1dTRuNTcyaGVmMTAwbTVzNyIsImV2ZW50X2lkIjoiZDUyNjIyNjktMWRlNy00Nzk0LTg0MzgtOTM2MDEzM2I2ZmQ3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTAxMzUyNTIsImV4cCI6MTc1MDEzODg1MiwiaWF0IjoxNzUwMTM1MjUyLCJqdGkiOiJiMTFmNTE1MC1lN2I3LTQxMzItYTJmMC0wMWZjNWFjNTFjZDEiLCJlbWFpbCI6InNpZEBldmVyeWJpdGUuY29tIn0.CDX63kHz0C_ZT9q4W0_JOvw4qRc2WEKjEQXJswxSDdZe3YCO6K4zik0MwZkfYRtuC4HMVQ593XHfCdKkp-q0SvcouDuDXmjLLPdrWq9HvkbGq8zaC5IZdjk9POzwkiJr4XXdE3vS4FxQhK_2vJ3U59ufz7wCisCmE14fh_skZ9PiYsPZmDIclni9jYGqVjXmEfXJrw7BQXTuMAEl0r12CltiW3lr2cS8CjC2QTb7CLnLTrrq_Z918-yyBv8Gi1SySWUH-gzkL1gx2oivKJgcnDQkoFmWF2FQRPBa7mZGjXF9jyPFj6F_oRV-KjOEVj9M5iU7MuoB0XLYz-bRWAv99A" \
     http://localhost:3000/api/users


### This is for parsing the cognito auth token. 
TOKEN='eyJraWQiOiJ5SjFnUEVuck9Cd3cwdktGZytRMFRISmlaM2ZYK0xvYmMwQWFSY0g4bUFJPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0OWM5NDlmZS05MDkxLTcwODYtMWEzMi03NWZmYzJkMmFmZTkiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMS5hbWF6b25hd3MuY29tXC91cy13ZXN0LTFfSHVWd3l3bUgxIiwiY29nbml0bzp1c2VybmFtZSI6IjQ5Yzk0OWZlLTkwOTEtNzA4Ni0xYTMyLTc1ZmZjMmQyYWZlOSIsIm9yaWdpbl9qdGkiOiJjYTc5ZmJkYy1jYTZkLTQ2ZTktODZiOS03NWVkYTVkNDg0YWUiLCJhdWQiOiI3NDZkN2M2aXR1dTRuNTcyaGVmMTAwbTVzNyIsImV2ZW50X2lkIjoiY2EyZmIyMDktNTBlNi00YzI0LTgzNmYtMDk5OThmYzY3MjZkIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTAxOTk1OTUsImV4cCI6MTc1MDM5ODk4NCwiaWF0IjoxNzUwMzk1Mzg0LCJqdGkiOiI0ZGMzNGI4MS0yMjk0LTQyMWYtOTBhOS03ZGU0ZTI3NGUyZmYiLCJlbWFpbCI6ImZzY29ua2xpbkBldmVyeWJpdGUuY29tIn0.JwNQt5QXlKDYwoVW3GidDYJ7RHSxBnAjlDm3SexYeC1CckSeph1gK6ibKKAop3xeUt2DSI-FumB3DOnSGcv2NWjdCjQN1SwZGorzctR9hwOdiGRQLCPP0Q1DR-_Hu8PkrDYbkV5Zv68LVIVvHB6vRwHJmKTexp8qb4qObsWyvdm7XgoRfhoTOUpUQgu4x_yMqlE35Rvdp5IoLTG7tAYt8XCACdVBWVachvIK-W6-XGbAlOL053erb8SmlvMDouA9K0zbx4aO292IFW0gBwpQibK_Fh2n6Qbi6seO03hgh5aKdJ2ct2CUPK3bO66c5ldKa167gJ5M88khLwkuJSB1rA'

echo "$TOKEN" | jq -R 'split(".") | .[1] | @base64d | fromjson'

#### This is the results:
echo "$TOKEN" | jq -R 'split(".") | .[1] | @base64d | fromjson'
{
  "sub": "094919ee-b081-7087-3d23-bca2850015d7",
  "cognito:groups": [
    "ADMIN"
  ],
  "email_verified": true,
  "iss": "https://cognito-idp.us-west-1.amazonaws.com/us-west-1_HuVwywmH1",
  "cognito:username": "094919ee-b081-7087-3d23-bca2850015d7",
  "origin_jti": "aa3e24ab-cd47-4d84-9fde-867b2d42a955",
  "aud": "746d7c6ituu4n572hef100m5s7",
  "event_id": "2cf8284b-1222-480a-b5d5-1b34caca1eed",
  "token_use": "id",
  "auth_time": 1750142415,
  "exp": 1750177820,
  "iat": 1750174220,
  "jti": "c0e7f292-7759-4b4d-b8cf-d38ab8509d7a",
  "email": "sid@everybite.com"