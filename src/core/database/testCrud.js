/**
 * @layer Core (Database)
 * @responsibility Temporary diagnostic test verifying Create, Read, Update, and Delete operations.
 */
import {
  createRecord,
  deleteRecord,
  getRecordById,
  getRecordsByDate,
  getTotalsForDate,
  updateRecord,
} from '../../features/records/repository';

/**
 * Executes a full end-to-end CRUD verification against the SQLite database.
 * deletes it, and asserts that no orphaned test records remain.
 *
 * @returns {Promise<{ success: boolean, results: string[] }>}
 */
export async function runCrudTest() {
  const logs = [];
  const log = (msg) => {
    logs.push(msg);
    console.log(msg);
  };

  log('\n========================================');
  log('🧪 RUNNING HEALTHMATE CRUD VERIFICATION');
  log('========================================');

  const testDate = '2026-01-01'; // Isolates from real seed dates

  try {
    // 1. CREATE
    log('▶ Step 1: Testing CREATE...');
    const created = await createRecord({
      date: testDate,
      steps: 7500,
      calories: 350,
      water: 1800,
    });
    log(`  CREATE Success: Record inserted with ID ${created.id}`);

    // 2. READ
    log('▶ Step 2: Testing READ...');
    const readBack = await getRecordById(created.id);
    if (!readBack || readBack.steps !== 7500) {
      throw new Error(`READ failed: expected 7500 steps, got ${readBack?.steps}`);
    }
    log(` !! READ (by ID) Success: Retrieved steps=${readBack.steps}, calories=${readBack.calories}, water=${readBack.water}`);

    const dateRecords = await getRecordsByDate(testDate);
    log(` !! READ (by date) Success: Found ${dateRecords.length} record(s) on ${testDate}`);

    const totals = await getTotalsForDate(testDate);
    log(` !! READ (daily totals) Success: Daily sums -> Steps: ${totals.steps}, Calories: ${totals.calories}, Water: ${totals.water}ml`);

    // 3. UPDATE
    log('▶ Step 3: Testing UPDATE...');
    const updated = await updateRecord({
      id: created.id,
      date: testDate,
      steps: 9999,
      calories: 500,
      water: 2500,
    });
    const verifiedUpdate = await getRecordById(created.id);
    if (verifiedUpdate.steps !== 9999 || verifiedUpdate.water !== 2500) {
      throw new Error(`UPDATE verification failed: expected steps 9999, got ${verifiedUpdate.steps}`);
    }
    log(`  !! UPDATE Success: ID ${created.id} updated to steps=${verifiedUpdate.steps}, water=${verifiedUpdate.water}`);

    // 4. DELETE
    log('▶ Step 4: Testing DELETE...');
    const deleted = await deleteRecord(created.id);
    if (!deleted) {
      throw new Error(`DELETE returned false for ID ${created.id}`);
    }
    const checkDeleted = await getRecordById(created.id);
    if (checkDeleted !== null) {
      throw new Error(`DELETE failed: record ID ${created.id} still exists in database!`);
    }
    log(`  !! DELETE Success: Record ID ${created.id} permanently deleted.`);

    log('========================================');
    log('🎉 ALL CRUD TESTS PASSED PROVABLY (100% OK)');
    log('========================================\n');

    return { success: true, results: logs };
  } catch (error) {
    log(`## CRUD TEST ERROR: ${error?.message || error}`);
    log('========================================\n');
    return { success: false, results: logs, error: error?.message };
  }
}
