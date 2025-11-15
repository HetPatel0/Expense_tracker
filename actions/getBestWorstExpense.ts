import { db } from "@/lib/db";
import { getSession } from "@/lib/server";

async function getBestWorstExpense(): Promise<{
    bestExpense?: number;
    worstExpense?: number;
    error?: string;
}> {
    const session = await getSession()
    const userId = session?.user.id
    if (!userId) {
        return { error: "user not found" }
    }

    try {
        const record = await db.record.findMany({
            where: { userId },
            select: { amount: true }
        })
        if (!record || record.length === 0) {
            return { bestExpense: 0, worstExpense: 0 }
        }
        const amounts = record.map((record) => record.amount)
        const bestExpense = Math.max(...amounts)
        const worstExpense = Math.min(...amounts)

        return { bestExpense, worstExpense }
    } catch (error) {
        console.error("Error while fetching record for best and worst expense")
        return { error: 'Database Error' }

    }
}
export default getBestWorstExpense;