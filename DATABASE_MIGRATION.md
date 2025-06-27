# Database Migration to Drizzle ORM

This document outlines the migration from raw SQLite queries to Drizzle ORM and how to manage database schema changes going forward.

## What Changed

### Before (better-sqlite3)

- Raw SQL queries using `db.prepare()` and `stmt.get()`
- Manual schema management
- No type safety
- Database connection in `src/config/index.tsx`

### After (Drizzle ORM)

- Type-safe database queries
- Schema defined in code (`src/lib/db/schema.ts`)
- Automatic migrations
- Database connection in `src/lib/db/index.ts`

## File Structure

```
src/lib/db/
├── index.ts              # Database connection and exports
├── schema.ts             # Database schema definitions
├── migrate.ts            # Migration runner
└── migrations/           # Generated migration files
    ├── 0000_initial_baseline.sql
    └── meta/
        └── _journal.json
```

## Database Schema

The schema is now defined in TypeScript with full type safety:

```typescript
// Example from src/lib/db/schema.ts
export const courses = sqliteTable("Courses", {
  courseId: integer("course_id").primaryKey().notNull(),
  courseName: text("course_name").notNull(),
  trainerId: integer("trainer_id").notNull(),
  // ... other fields
});

// TypeScript types are automatically generated
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
```

## Making Database Changes

### 1. Update Schema

Edit `src/lib/db/schema.ts` to add/modify tables or columns.

### 2. Generate Migration

```bash
npm run db:generate
```

### 3. Apply Migration (Development)

For development, you can use push to sync schema directly:

```bash
npm run db:push
```

### 4. Apply Migration (Production)

For production, always use migrations:

```bash
npm run db:migrate:run
```

## Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to database (dev only)
- `npm run db:migrate:run` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio for database inspection

## Migration Best Practices

1. **Always use migrations in production** - Never use `db:push` in production
2. **Test migrations locally** - Run migrations on a copy of production data
3. **Review generated SQL** - Check migration files before applying
4. **Backup before migrations** - Always backup production database first
5. **One change per migration** - Keep migrations focused and atomic

## Example Usage

### Before (Raw SQL)

```typescript
const stmt = db.prepare("SELECT * FROM Courses WHERE trainer_id = ?");
const courses = stmt.all(trainerId);
```

### After (Drizzle)

```typescript
import { db, courses } from "@/lib/db";
import { eq } from "drizzle-orm";

const coursesData = await db
  .select()
  .from(courses)
  .where(eq(courses.trainerId, trainerId));
```

## Benefits

1. **Type Safety** - Compile-time checking of queries and data types
2. **Auto-completion** - Full IDE support for database operations
3. **Migration Management** - Automatic schema versioning and migration generation
4. **Performance** - Optimized queries and connection pooling
5. **Maintainability** - Schema changes are tracked and versioned

## Troubleshooting

### Schema Mismatch Errors

If you get schema mismatch errors, ensure your schema matches the actual database:

1. Use `npx drizzle-kit introspect` to generate schema from existing database
2. Compare with your current schema
3. Update schema or create migration as needed

### Migration Conflicts

If migrations conflict:

1. Reset migrations: `rm -rf src/lib/db/migrations`
2. Regenerate: `npm run db:generate`
3. Review and test the new migration

## Future Development

All new database changes should:

1. Be made in the schema file first
2. Generate proper migrations
3. Be tested locally before deployment
4. Include rollback considerations

This ensures database changes are tracked, versioned, and safely deployable.
