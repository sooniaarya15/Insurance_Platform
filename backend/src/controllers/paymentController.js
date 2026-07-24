const prisma = require("../config/db");

async function recordPayment(req, res) {
  try {
    const { policyId, amount, paymentStatus, paymentDate } = req.body;
    const payment = await prisma.premiumPayment.create({
      data: {
        policyId: Number(policyId),
        amount: Number(amount),
        paymentStatus: paymentStatus || "PAID",
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: "Error recording payment", error: err.message });
  }
}

async function getPayments(req, res) {
  try {
    const { policyId } = req.query;
    const payments = await prisma.premiumPayment.findMany({
      where: policyId ? { policyId: Number(policyId) } : undefined,
      include: { policy: { include: { customer: true } } },
      orderBy: { id: "desc" },
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments", error: err.message });
  }
}

async function getOverdueAlerts(req, res) {
  try {
    const activePolicies = await prisma.policy.findMany({
      where: { status: "ACTIVE" },
      include: { payments: { orderBy: { paymentDate: "desc" }, take: 1 }, customer: true },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const overdue = activePolicies.filter((p) => {
      if (p.payments.length === 0) return true;
      return new Date(p.payments[0].paymentDate) < thirtyDaysAgo;
    });

    res.json(overdue);
  } catch (err) {
    res.status(500).json({ message: "Error fetching overdue alerts", error: err.message });
  }
}

module.exports = { recordPayment, getPayments, getOverdueAlerts };