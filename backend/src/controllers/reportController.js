const prisma = require("../config/db");

// ADMIN dashboard
async function getDashboardStats(req, res) {
  try {
    const [
      totalCustomers,
      totalPolicies,
      activePolicies,
      expiredPolicies,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      revenueSum,
      recentCustomers,
      recentPolicies,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.policy.count(),
      prisma.policy.count({ where: { status: "ACTIVE" } }),
      prisma.policy.count({ where: { status: { in: ["EXPIRED", "CANCELLED"] } } }),
      prisma.claim.count({ where: { status: "PENDING" } }),
      prisma.claim.count({ where: { status: "APPROVED" } }),
      prisma.claim.count({ where: { status: "REJECTED" } }),
      prisma.premiumPayment.aggregate({ _sum: { amount: true } }),
      prisma.customer.findMany({ orderBy: { id: "desc" }, take: 5 }),
      prisma.policy.findMany({
        orderBy: { id: "desc" },
        take: 5,
        include: { customer: true, plan: true },
      }),
    ]);

    res.json({
      totalCustomers,
      totalPolicies,
      activePolicies,
      expiredPolicies,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      revenue: revenueSum._sum.amount || 0,
      recentCustomers,
      recentPolicies,
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
}

// CUSTOMER dashboard summary
async function getMySummary(req, res) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
      include: {
        policies: { include: { plan: true, payments: true, claims: true } },
      },
    });

    if (!customer) {
      return res.json({ policies: [], premiumDue: 0, paymentHistoryCount: 0, claims: [] });
    }

    let premiumDue = 0;
    let paymentHistoryCount = 0;
    const claims = [];

    customer.policies.forEach((policy) => {
      paymentHistoryCount += policy.payments.length;
      if (policy.status === "ACTIVE" && policy.payments.length === 0) {
        premiumDue += policy.premiumAmount;
      }
      policy.claims.forEach((c) => claims.push({ ...c, policyNumber: policy.policyNumber }));
    });

    res.json({
      totalPolicies: customer.policies.length,
      activePolicies: customer.policies.filter((p) => p.status === "ACTIVE").length,
      pendingPolicies: customer.policies.filter((p) => p.status === "PENDING").length,
      premiumDue,
      paymentHistoryCount,
      claims,
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating summary", error: err.message });
  }
}

// ADMIN — simple CSV export of customers (Reports download)
async function exportCustomersCSV(req, res) {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { id: "asc" } });
    let csv = "ID,Name,Email,Phone,Address\n";
    customers.forEach((c) => {
      csv += `${c.id},"${c.name}","${c.email}","${c.phone || ""}","${(c.address || "").replace(/"/g, '""')}"\n`;
    });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=customers-report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Error exporting report", error: err.message });
  }
}

module.exports = { getDashboardStats, getMySummary, exportCustomersCSV };