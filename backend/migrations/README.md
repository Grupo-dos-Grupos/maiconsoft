# Database Migrations

This folder contains SQL migration files to set up and manage the database schema.

## Usage

Run all pending migrations:

```bash
npm run migrate
```

Or directly:

```bash
node migrations/runMigrations.js
```

## How It Works

1. The migration runner checks if a `migrations` table exists (creates it if needed)
2. It reads all `.sql` files in this directory in alphabetical order
3. For each migration file:
   - Checks if it has already been executed (recorded in `migrations` table)
   - If not executed, runs the SQL and records it
   - If already executed, skips it

## Migration Files

- `001_create_migrations_table.sql` - Creates the migrations tracking table
- `002_create_clientes_table.sql` - Creates the clientes table
- `003_create_produtos_table.sql` - Creates the produtos table
- `004_create_pedidos_table.sql` - Creates the pedidos table
- `005_create_pedido_produto_table.sql` - Creates the pedido_produto junction table
- `006_create_indexes.sql` - Creates performance indexes

## Adding New Migrations

1. Create a new `.sql` file with a numbered prefix (e.g., `007_add_new_column.sql`)
2. Write your SQL statements in the file
3. Run `npm run migrate` to execute the new migration

## Notes

- Migrations are executed in alphabetical order (by filename)
- Each migration is tracked in the `migrations` table
- Failed migrations will rollback the transaction
- Already executed migrations are automatically skipped

