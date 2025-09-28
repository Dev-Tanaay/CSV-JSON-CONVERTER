import { pgTable, serial, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const userTable = pgTable("public.users", {
  id: serial("id").primaryKey(),                 
  name: varchar("name", { length: 255 }).notNull(), 
  age: integer("age").notNull(),                 
  address: jsonb("address"),                     
  additionalInfo: jsonb("additional_info"),     
});