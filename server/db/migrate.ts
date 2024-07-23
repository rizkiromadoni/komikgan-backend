import { migrate } from "drizzle-orm/node-postgres/migrator";
import { client, db } from ".";
import drizzleConfig from "../../drizzle.config";

migrate(db, {
    migrationsFolder: drizzleConfig.out!
}).then(() => console.log("Migration complete")).catch(console.error).finally(async () => await client.end())