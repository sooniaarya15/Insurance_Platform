const prisma = require("../config/db");

async function getCustomerForUser(userId) {
  return prisma.customer.findUnique({ where: { userId } });
}

// CUSTOMER pays for own policy; ADMIN/AGENT can record on behalf of anyone
async function recordPayment(req, res) {
  try {
    const { policyId, amount, paymentStatus, paymentDate } = req.body;

    if (req.user.role === "CUSTOMER") {
      const customer = await getCustomerForUser(req.user.id);
      const policy = await prisma.policy.findUnique({ where: { id: Number(policyId) } });
      if (!customer || !policy || policy.customerId !== customer.id) {
        return res.status(403).json({ message: "You can only pay for your own policies" });
      }
    }

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
    let where = policyId ? { policyId: Number(policyId) } : {};

    if (req.user.role === "CUSTOMER") {
      const customer = await getCustomerForUser(req.user.id);
      if (!customer) return res.json([]);
      where.policy = { customerId: customer.id };
    }

    const payments = await prisma.premiumPayment.findMany({
      where,
      include: { policy: { include: { customer: true, plan: true } } },
      orderBy: { id: "desc" },
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments", error: err.message });
  }
}

module.exports = { recordPayment, getPayments };