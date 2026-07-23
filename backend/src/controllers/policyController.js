const prisma = require("../config/db");

async function createPolicy(req, res) {
  try {
    const { customerId, policyType, policyNumber, premiumAmount, startDate, endDate, status } = req.body;
    const policy = await prisma.policy.create({
      data: {
        customerId: Number(customerId),
        policyType,
        policyNumber,
        premiumAmount: Number(premiumAmount),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || "ACTIVE",
      },
    });
    res.status(201).json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error creating policy", error: err.message });
  }
}

async function getPolicies(req, res) {
  try {
    const { status } = req.query;
    const policies = await prisma.policy.findMany({
      where: status ? { status } : undefined,
      include: { customer: true },
      orderBy: { id: "desc" },
    });
    res.json(policies);
  } catch (err) {
    res.status(500).json({ message: "Error fetching policies", error: err.message });
  }
}

async function getPolicyById(req, res) {
  try {
    const policy = await prisma.policy.findUnique({
      where: { id: Number(req.params.id) },
      include: { customer: true, claims: true, payments: true },
    });
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error fetching policy", error: err.message });
  }
}

async function updatePolicy(req, res) {
  try {
    const { policyType, premiumAmount, startDate, endDate, status } = req.body;
    const policy = await prisma.policy.update({
      where: { id: Number(req.params.id) },
      data: {
        policyType,
        premiumAmount: premiumAmount ? Number(premiumAmount) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
      },
    });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error updating policy", error: err.message });
  }
}

async function renewPolicy(req, res) {
  try {
    const existing = await prisma.policy.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ message: "Policy not found" });

    const newEndDate = new Date(existing.endDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    const policy = await prisma.policy.update({
      where: { id: Number(req.params.id) },
      data: { endDate: newEndDate, status: "ACTIVE" },
    });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error renewing policy", error: err.message });
  }
}

async function cancelPolicy(req, res) {
  try {
    const policy = await prisma.policy.update({
      where: { id: Number(req.params.id) },
      data: { status: "CANCELLED" },
    });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error cancelling policy", error: err.message });
  }
}

module.exports = { createPolicy, getPolicies, getPolicyById, updatePolicy, renewPolicy, cancelPolicy };