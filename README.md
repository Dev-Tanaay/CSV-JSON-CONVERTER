# CSV to JSON Formatter

This project reads a CSV file, converts each row into a nested JSON object, and uploads the data into a PostgreSQL database.

---

## Features

- Converts CSV rows to nested JSON objects using dot notation in headers (e.g., `name.firstName`)  
- Stores mandatory fields (`name`, `age`, `address`) in designated database columns  
- Stores all other fields in `additional_info` JSON column  
- Handles large CSV files efficiently using streaming  
- TypeScript-based for type safety and maintainability  

---

## Setup 
```bash
git clone https://github.com/Dev-Tanaay/CSV-JSON-CONVERTER.git
cd CSV-JSON-CONVERTER
Add .env file with the following variables:

env
DB_URL=<your_postgres_connection_string>
FILE_PATH=<path_to_csv_file>

npm install
npm run build
npm run start
```

The script will read the CSV, parse nested fields, and insert the data into the database table.

Database Table
The PostgreSQL table used is public.users with the following columns:

Column	Type	Notes
id	serial	Primary key, auto-increment
name	varchar	Mandatory (firstName + lastName)
age	int4	Mandatory
address	jsonb	Optional nested JSON object
additional_info	jsonb	Optional JSON for other fields

Example CSV
name.firstName,name.lastName,age,address.line1,address.city,gender,email
Rohit,Prasad,35,A-563 Rakshak Society,Pune,male,rohit@gmail.com
Anita,Sharma,19,12 Sunrise Apartments,Mumbai,female,anita@example.com
Expected JSON Output
json
Copy code
[
  {
    "name": { "firstName": "Rohit", "lastName": "Prasad" },
    "age": "35",
    "address": { "line1": "A-563 Rakshak Society", "city": "Pune" },
    "gender": "male",
    "email": "rohit@gmail.com"
  },
  {
    "name": { "firstName": "Anita", "lastName": "Sharma" },
    "age": "19",
    "address": { "line1": "12 Sunrise Apartments", "city": "Mumbai" },
    "gender": "female",
    "email": "anita@example.com"
  }
]