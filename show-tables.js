const { Sequelize } = require('sequelize');

async function showAllTables() {
  console.log('📊 Database Tables in ethiopian-tutorial-app\n');
  console.log('=' .repeat(50));
  
  const sequelize = new Sequelize('postgresql://postgres:password@localhost:5432/ethiopian-tutorial-app', {
    dialect: 'postgres',
    logging: false
  });
  
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL database\n');
    
    // Get all tables
    const [tables] = await sequelize.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 All Tables:');
    console.log('-'.repeat(30));
    
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name} (${table.table_type})`);
    });
    
    console.log(`\n📊 Total Tables: ${tables.length}`);
    
    // Get table details
    console.log('\n🔍 Table Details:');
    console.log('=' .repeat(50));
    
    for (const table of tables) {
      console.log(`\n📋 Table: ${table.table_name}`);
      console.log('-'.repeat(30));
      
      // Get columns for each table
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = '${table.table_name}' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  • ${col.column_name}: ${col.data_type} (${nullable})${defaultVal}`);
      });
      
      // Get row count
      const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
      console.log(`  📊 Rows: ${count[0].count}`);
    }
    
    // Get enums
    console.log('\n🏷️  Custom Types (Enums):');
    console.log('-'.repeat(30));
    
    const [enums] = await sequelize.query(`
      SELECT t.typname as enum_name, 
             array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
      WHERE n.nspname = 'public' 
      GROUP BY t.typname
      ORDER BY t.typname
    `);
    
    enums.forEach(enumType => {
      console.log(`  • ${enumType.enum_name}: [${enumType.enum_values.join(', ')}]`);
    });
    
    console.log('\n🎉 Database structure complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

showAllTables();
