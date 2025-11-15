import { db } from "@/lib/db";
import { getSession } from "@/lib/server";

async function getUserRecord() : Promise<{
  record?: number;
  daysWithRecords?: number;
  error?: string;
}> {
    const session = await getSession()
    const userId=  session?.user.id
     if (!userId) {
    return { error: 'User not found' };
  } try {
    const records = await db.record.findMany({
      where: { userId },
    });

    const record = records.reduce((sum, record) => sum + record.amount, 0);

    const daysWithRecords = records.filter(
      (record) => record.amount > 0
    ).length;

    return { record, daysWithRecords };
  } catch (error) {
    console.error('Error fetching user record:', error); // Log the error
    return { error: 'Database error' };
  }
}
export default getUserRecord