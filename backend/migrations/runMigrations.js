const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if migrations table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      )
    `);
    
    // Create migrations table if it doesn't exist
    if (!tableExists.rows[0].exists) {
      await client.query(`
        CREATE TABLE migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created migrations table');
    }
    
    // Get migrations directory
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log('🔄 Running migrations...\n');
    
    for (const file of files) {
      const migrationName = file.replace('.sql', '');
      
      // Check if migration has already been run
      const existing = await client.query(
        'SELECT * FROM migrations WHERE name = $1',
        [migrationName]
      );
      
      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }
      
      // Read and execute migration file
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await client.query(sql);
        
        // Record migration as executed
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migrationName]
        );
        
        console.log(`✅ Executed ${file}`);
      } catch (error) {
        console.error(`❌ Error executing ${file}:`, error.message);
        throw error;
      }
    }
    
    await client.query('COMMIT');
    console.log('\n✨ All migrations completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };

