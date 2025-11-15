'use server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/server';
import { Record } from '@/types/records';

async function getRecords(): Promise<{
  records?: Record[];
  error?: string;
}> {
  const session = await getSession();
  const userId = session?.user.id;

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    const records = await db.record.findMany({
      where: { userId },
      orderBy: {
        date: 'desc', // Sort by the `date` field in descending order
      },
      take: 10, // Limit the request to 10 records
    });

    return { records };
  } catch (error) {
    console.error('Error fetching records:', error); // Log the error
    return { error: 'Database error' };
  }
}

export default getRecords;