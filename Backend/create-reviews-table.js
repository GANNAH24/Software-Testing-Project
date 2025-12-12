#!/usr/bin/env node

/**
 * Script to create the reviews table in Supabase
 * Run this with: node create-reviews-table.js
 */

const { supabase } = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function createReviewsTable() {
    try {
        console.log('Creating reviews table...');

        // Read the SQL file
        const sqlFile = path.join(__dirname, 'create-reviews-table.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('Error creating reviews table:', error);
            throw error;
        }

        console.log('✅ Reviews table created successfully!');
        console.log('Data:', data);

    } catch (error) {
        console.error('❌ Failed to create reviews table:', error.message);
        process.exit(1);
    }
}

createReviewsTable();
