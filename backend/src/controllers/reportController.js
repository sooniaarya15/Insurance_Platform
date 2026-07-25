const prisma = require("../config/db");

async function getDashboardStats(req, res) {
  try {
    const [activePolicies, expiredPolicies, totalCustomers, claimStats, premiumSum] =
      await Promise.all([
        prisma.policy.count({ where: { status: "ACTIVE" } }),
        prisma.policy.count({ where: { status: { in: ["EXPIRED", "CANCELLED"] } } }),
        prisma.customer.count(),
        prisma.claim.groupBy({ by: ["status"], _count: { status: true } }),
        prisma.premiumPayment.aggregate({ _sum: { amount: true } }),
      ]);

    res.json({
      activePolicies,
      expiredPolicies,
      totalCustomers,
      claimStats,
      totalPremiumCollected: premiumSum._sum.amount || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
}

module.exports = { getDashboardStats };