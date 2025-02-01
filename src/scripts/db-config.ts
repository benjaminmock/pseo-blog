import Database from "better-sqlite3";
import * as pathModule from "path";

const dbPath = pathModule.join(process.cwd(), "yoga.db");
const database = new Database(dbPath);

export { database as db };
