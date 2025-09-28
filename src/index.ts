import fs from "fs";
import readline from "readline";
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { userTable } from "./db/table";

const db = drizzle(process.env.DATABASE_URL!);

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"' && line[i + 1] === "'") {
            current += "'";
            i++;
        }
        else if (char === '"') {
            inQuotes = !inQuotes;
        }
        else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;

}

function buildNestedObject(headers: string[], values: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    headers.forEach((header, index) => {
        const keys = header.split('.');
        let current: Record<string, unknown> = result;
        keys.forEach((key, keyIndx) => {
            if (keyIndx === keys.length - 1) {
                current[key] = values[index];
            }
            else {
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key] as Record<string, unknown>;
            }
        })
    })
    return result;
}

export async function readCSV(filePath: string) {
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    let headers: string[] = [];
    let rows: Record<string, unknown>[] = [];
    for await (const line of rl) {
        if (!line.trim()) continue;
        const values = parseCSVLine(line);
        if (headers.length === 0) {
            headers = values;
        } else {
            const row = buildNestedObject(headers, values);
            rows.push(row);
        }
    }
    return rows;
}
async function main() {
    const result = await readCSV(process.env.FILE_PATH || 'sample.csv');

    for (const data of result) {
        const nameObj = data['name'] as Record<string, unknown>;
        const fullName = nameObj ? Object.values(nameObj).filter(Boolean).join(' ') : '';

        const ageStr = data['age'] as string | undefined;
        const age = ageStr ? parseInt(ageStr, 10) : 0;

        const addressObj = data['address'] as Record<string, unknown> | undefined;
        const address = addressObj ?? null;

        const additionalInfo: Record<string, unknown> = {};
        Object.keys(data).forEach((key) => {
            if (key !== 'name' && key !== 'age' && key !== 'address') {
                additionalInfo[key] = data[key];
            }
        });

        await db.insert(userTable).values({
            name: fullName,
            age: age,
            address: address,
            additionalInfo: Object.keys(additionalInfo).length ? additionalInfo : null,
        });
    }

    console.log("All rows inserted successfully!");
}


main()